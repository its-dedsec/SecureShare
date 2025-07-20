import { supabase } from '@/integrations/supabase/client';
import { EncryptedFile } from './encryption';

export interface FileRecord {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  access_type?: 'owner' | 'shared';
  recipient_email?: string;
  requires_share_password?: boolean;
  expires_at?: string;
  share_id?: string;
}

export interface ShareFileData {
  recipientEmail: string;
  accessPassword?: string;
  expiresAt?: string;
}

// Store encrypted file in Supabase
export async function storeEncryptedFileInDB(encryptedFile: EncryptedFile): Promise<string> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Convert ArrayBuffer and Uint8Arrays to base64 strings for database storage
  const encryptedDataB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedFile.encryptedData)));
  const ivB64 = btoa(String.fromCharCode(...encryptedFile.iv));
  const saltB64 = btoa(String.fromCharCode(...encryptedFile.salt));
  
  const { data, error } = await supabase
    .from('encrypted_files')
    .insert({
      user_id: user.id,
      filename: encryptedFile.filename,
      file_size: encryptedFile.originalSize,
      mime_type: 'application/octet-stream',
      encrypted_data: encryptedDataB64,
      iv: ivB64,
      salt: saltB64
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error storing file:', error);
    throw new Error('Failed to store encrypted file');
  }

  return data.id;
}

// Get all files accessible to the current user (owned + shared)
export async function getUserFiles(): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from('accessible_files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files');
  }

  return (data || []).map(file => ({
    ...file,
    access_type: file.access_type as 'owner' | 'shared'
  }));
}

// Get encrypted file data by ID (works for both owned and shared files)
export async function getEncryptedFileFromDB(fileId: string): Promise<EncryptedFile | null> {
  // First try to get from accessible_files view (handles both owned and shared files)
  const { data: accessibleFile, error: accessError } = await supabase
    .from('accessible_files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (accessError) {
    if (accessError.code === 'PGRST116') {
      return null; // File not found or no access
    }
    console.error('Error fetching file:', accessError);
    throw new Error('Failed to fetch encrypted file');
  }

  // If we don't have the encrypted data in the view, we need to get it from the main table
  // This happens for shared files where the view doesn't include the actual encrypted data
  let encryptedData, iv, salt;
  
  if (accessibleFile.encrypted_data) {
    // We have direct access (owned file)
    encryptedData = Uint8Array.from(atob(accessibleFile.encrypted_data), c => c.charCodeAt(0)).buffer;
    iv = Uint8Array.from(atob(accessibleFile.iv), c => c.charCodeAt(0));
    salt = Uint8Array.from(atob(accessibleFile.salt), c => c.charCodeAt(0));
  } else {
    // This is a shared file, get the encrypted data from the main table
    // We can access this because the file_shares table validates our access
    const { data: fileData, error: fileError } = await supabase
      .from('encrypted_files')
      .select('encrypted_data, iv, salt')
      .eq('id', fileId)
      .single();

    if (fileError) {
      console.error('Error fetching encrypted file data:', fileError);
      throw new Error('Failed to fetch encrypted file data');
    }

    encryptedData = Uint8Array.from(atob(fileData.encrypted_data), c => c.charCodeAt(0)).buffer;
    iv = Uint8Array.from(atob(fileData.iv), c => c.charCodeAt(0));
    salt = Uint8Array.from(atob(fileData.salt), c => c.charCodeAt(0));
  }

  return {
    filename: accessibleFile.filename,
    originalSize: accessibleFile.file_size,
    encryptedData,
    iv,
    salt,
    authTag: new Uint8Array(16), // Placeholder, will be extracted during decryption
    timestamp: new Date(accessibleFile.created_at).getTime(),
    checksum: '' // Not stored separately in this implementation
  };
}

// Delete encrypted file
export async function deleteEncryptedFileFromDB(fileId: string): Promise<void> {
  const { error } = await supabase
    .from('encrypted_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// Share file with another user
export async function shareFile(fileId: string, shareData: ShareFileData): Promise<void> {
  // Check if user exists
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', shareData.recipientEmail)
    .single();

  const insertData = {
    file_id: fileId,
    owner_id: (await supabase.auth.getUser()).data.user?.id,
    recipient_email: shareData.recipientEmail,
    recipient_id: users?.id || null,
    access_password: shareData.accessPassword || null,
    expires_at: shareData.expiresAt || null
  };

  const { error } = await supabase
    .from('file_shares')
    .insert(insertData);

  if (error) {
    console.error('Error sharing file:', error);
    if (error.code === '23505') {
      throw new Error('File is already shared with this user');
    }
    throw new Error('Failed to share file');
  }
}

// Get file shares for a specific file
export async function getFileShares(fileId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('file_shares')
    .select(`
      *,
      profiles!file_shares_recipient_id_fkey(email, full_name)
    `)
    .eq('file_id', fileId);

  if (error) {
    console.error('Error fetching file shares:', error);
    throw new Error('Failed to fetch file shares');
  }

  return data || [];
}

// Remove file share
export async function removeFileShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('file_shares')
    .delete()
    .eq('id', shareId);

  if (error) {
    console.error('Error removing file share:', error);
    throw new Error('Failed to remove file share');
  }
}

// Verify share access password
export async function verifySharePassword(shareId: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('file_shares')
    .select('access_password')
    .eq('id', shareId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.access_password === password;
}

// Update share access timestamp
export async function updateShareAccess(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('file_shares')
    .update({ accessed_at: new Date().toISOString() })
    .eq('id', shareId);

  if (error) {
    console.error('Error updating share access:', error);
  }
}