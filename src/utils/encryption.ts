
/**
 * Advanced AES-256-GCM Encryption Utilities
 * Provides military-grade encryption with authentication and integrity verification
 */

export interface EncryptedFile {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
  authTag: Uint8Array;
  filename: string;
  originalSize: number;
  timestamp: number;
  checksum: string;
}

export interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  uploadDate: string;
  encrypted: boolean;
  checksum: string;
}

/**
 * Derives a cryptographic key from password using PBKDF2
 * Uses 100,000 iterations for resistance against brute force attacks
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a cryptographically secure random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Generates a cryptographically secure random IV
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Calculates SHA-256 checksum for file integrity verification
 */
export async function calculateChecksum(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts a file using AES-256-GCM with authentication
 * Provides both confidentiality and integrity protection
 */
export async function encryptFile(file: File, password: string): Promise<EncryptedFile> {
  console.log(`Starting encryption of file: ${file.name} (${file.size} bytes)`);
  
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);
  
  const fileBuffer = await file.arrayBuffer();
  const originalChecksum = await calculateChecksum(fileBuffer);
  
  console.log(`Generated salt and IV, derived encryption key`);
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    fileBuffer
  );
  
  // Extract authentication tag (last 16 bytes)
  const authTag = new Uint8Array(encryptedData.slice(-16));
  const ciphertext = encryptedData.slice(0, -16);
  
  console.log(`File encrypted successfully. Encrypted size: ${ciphertext.byteLength} bytes`);
  
  return {
    encryptedData: ciphertext,
    iv,
    salt,
    authTag,
    filename: file.name,
    originalSize: file.size,
    timestamp: Date.now(),
    checksum: originalChecksum
  };
}

/**
 * Decrypts a file and verifies its integrity
 * Throws error if decryption fails or integrity check fails
 */
export async function decryptFile(encryptedFile: EncryptedFile, password: string): Promise<File> {
  console.log(`Starting decryption of file: ${encryptedFile.filename}`);
  
  const key = await deriveKey(password, encryptedFile.salt);
  
  // Reconstruct the full encrypted data with auth tag
  const fullEncryptedData = new ArrayBuffer(encryptedFile.encryptedData.byteLength + encryptedFile.authTag.byteLength);
  const fullEncryptedArray = new Uint8Array(fullEncryptedData);
  fullEncryptedArray.set(new Uint8Array(encryptedFile.encryptedData), 0);
  fullEncryptedArray.set(encryptedFile.authTag, encryptedFile.encryptedData.byteLength);
  
  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encryptedFile.iv,
        tagLength: 128
      },
      key,
      fullEncryptedData
    );
    
    // Verify integrity
    const decryptedChecksum = await calculateChecksum(decryptedData);
    if (decryptedChecksum !== encryptedFile.checksum) {
      throw new Error('File integrity verification failed - file may be corrupted');
    }
    
    console.log(`File decrypted successfully and integrity verified`);
    
    return new File([decryptedData], encryptedFile.filename, {
      type: 'application/octet-stream'
    });
    
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt file - incorrect password or corrupted data');
  }
}
