import React, { useState } from 'react';
import { Share2, Mail, Lock, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { shareFile } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';

interface FileShareProps {
  fileId: string;
  filename: string;
  onShareComplete?: () => void;
}

const FileShare = ({ fileId, filename, onShareComplete }: FileShareProps) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (!recipientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);

    try {
      const shareData = {
        recipientEmail: recipientEmail.trim(),
        accessPassword: accessPassword.trim() || undefined,
        expiresAt: expiresAt || undefined
      };

      await shareFile(fileId, shareData);

      toast({
        title: "File Shared Successfully",
        description: `${filename} has been shared with ${recipientEmail}`,
      });

      // Reset form
      setRecipientEmail('');
      setAccessPassword('');
      setExpiresAt('');
      setIsOpen(false);
      onShareComplete?.();

    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Failed to share file",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const resetForm = () => {
    setRecipientEmail('');
    setAccessPassword('');
    setExpiresAt('');
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-400" />
            Share "{filename}"
          </DialogTitle>
        </DialogHeader>
        
        <Card className="p-4 bg-gray-800 border-gray-600">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recipient Email *
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="bg-gray-900 border-gray-600 text-white"
                disabled={isSharing}
              />
            </div>

            <div>
              <Label htmlFor="accessPassword" className="text-white flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Additional Password (Optional)
              </Label>
              <Input
                id="accessPassword"
                type="password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder="Extra security password"
                className="bg-gray-900 border-gray-600 text-white"
                disabled={isSharing}
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional extra password the recipient must enter to access the file
              </p>
            </div>

            <div>
              <Label htmlFor="expiresAt" className="text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expires At (Optional)
              </Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={getMinDateTime()}
                className="bg-gray-900 border-gray-600 text-white"
                disabled={isSharing}
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty for permanent access
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleShare}
                disabled={isSharing || !recipientEmail.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSharing ? 'Sharing...' : 'Share File'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSharing}
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FileShare;