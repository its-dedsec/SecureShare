
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Lock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { encryptFile } from '@/utils/encryption';
import { storeEncryptedFileInDB } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: () => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      console.log('File selected:', acceptedFiles[0].name, acceptedFiles[0].size, 'bytes');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB limit
  });

  const validatePassword = () => {
    if (password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile || !validatePassword()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting secure upload process...');
      
      // Simulate progress during encryption
      setUploadProgress(25);
      
      const encryptedFile = await encryptFile(selectedFile, password);
      setUploadProgress(75);
      
      const fileId = await storeEncryptedFileInDB(encryptedFile);
      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been encrypted and stored securely`,
      });
      
      // Reset form
      setSelectedFile(null);
      setPassword('');
      setConfirmPassword('');
      onUploadComplete();
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <div className="space-y-6">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Secure File Upload</h2>
          <p className="text-gray-400">
            Files are encrypted with AES-256-GCM before storage
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {selectedFile ? (
            <div className="text-white">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-gray-400">
              <p className="text-lg mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm">or click to browse (max 100MB)</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <Alert className="bg-blue-900/20 border-blue-700">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                Choose a strong password - you'll need it to decrypt your file later.
                Password requirements: minimum 8 characters.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="password" className="text-white">
                  Encryption Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isUploading}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isUploading}
                />
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Encrypting and uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={isUploading || !password || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Encrypting...' : 'Encrypt & Upload'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;
