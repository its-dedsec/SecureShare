
import React, { useEffect, useState } from 'react';
import { File, Download, Trash2, Lock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { decryptFile } from '@/utils/encryption';
import { FileRecord, getUserFiles, getEncryptedFileFromDB, deleteEncryptedFileFromDB } from '@/utils/supabaseStorage';
import FileShare from './FileShare';
import { toast } from '@/hooks/use-toast';

interface FileListProps {
  refreshTrigger: number;
}

const FileList = ({ refreshTrigger }: FileListProps) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const loadFiles = async () => {
    try {
      const fileList = await getUserFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: "Error",
        description: "Failed to load file list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    if (!downloadPassword) {
      toast({
        title: "Password Required",
        description: "Please enter the decryption password",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);

    try {
      console.log('Starting secure download process...');
      
      const encryptedFile = await getEncryptedFileFromDB(fileId);
      if (!encryptedFile) {
        throw new Error('File not found');
      }

      const decryptedFile = await decryptFile(encryptedFile, downloadPassword);
      
      // Create download link
      const url = URL.createObjectURL(decryptedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = decryptedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: `${decryptedFile.name} has been decrypted and downloaded`,
      });

      setDownloadPassword('');
      setSelectedFileId(null);

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to decrypt file",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${filename}"?`)) {
      return;
    }

    try {
      await deleteEncryptedFileFromDB(fileId);
      toast({
        title: "File Deleted",
        description: `${filename} has been permanently deleted`,
      });
      loadFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareComplete = () => {
    loadFiles(); // Refresh the file list
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gray-900 border-gray-700">
        <div className="text-center text-gray-400">Loading files...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Encrypted Files</h2>
        <span className="text-sm text-gray-400">({files.length} files)</span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <File className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No files uploaded yet</h3>
          <p className="text-gray-500">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-8 w-8 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white truncate">{file.filename}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>AES-256 Encrypted</span>
                    </div>
                    {file.access_type === 'shared' && (
                      <span className="text-green-400 text-xs">Shared with you</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Decrypt & Download</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert className="bg-yellow-900/20 border-yellow-700">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <AlertDescription className="text-yellow-200">
                          Enter the password you used when uploading "{file.filename}" to decrypt and download it.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="downloadPassword" className="text-white">
                          Decryption Password
                        </Label>
                        <Input
                          id="downloadPassword"
                          type="password"
                          value={downloadPassword}
                          onChange={(e) => setDownloadPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="bg-gray-800 border-gray-600 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleDownload(file.id)}
                        />
                      </div>
                      
                      <Button
                        onClick={() => handleDownload(file.id)}
                        disabled={!downloadPassword || isDownloading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isDownloading ? 'Decrypting...' : 'Decrypt & Download'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {file.access_type === 'owner' && (
                  <FileShare 
                    fileId={file.id} 
                    filename={file.filename}
                    onShareComplete={handleShareComplete}
                  />
                )}

                {file.access_type === 'owner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={() => handleDelete(file.id, file.filename)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default FileList;
