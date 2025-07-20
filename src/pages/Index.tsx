
import React, { useState, useEffect } from 'react';
import { Shield, Github, FileKey, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import SecurityInfo from '@/components/SecurityInfo';
import UserProfile from '@/components/UserProfile';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FileKey className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SecureShare</h1>
                  <p className="text-xs text-gray-400">Military-grade file encryption</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">AES-256 Protected</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Secure File Sharing System
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Upload, encrypt, and share files with military-grade AES-256-GCM encryption. 
              Your files are protected with zero-knowledge client-side encryption.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Get Started - Sign In
            </Button>
          </div>

          <div className="mt-16">
            <SecurityInfo />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Built with React, TypeScript, and Web Crypto API
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span>🔒 Client-side encryption</span>
                <span>🛡️ Zero-knowledge architecture</span>
                <span>⚡ Modern web standards</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileKey className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SecureShare</h1>
                <p className="text-xs text-gray-400">Military-grade file encryption</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">AES-256 Protected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Secure File Sharing System
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload, encrypt, and share files with military-grade AES-256-GCM encryption. 
            Your files are protected with zero-knowledge client-side encryption.
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Upload Files
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              My Files
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Security Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <FileList refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityInfo />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Built with React, TypeScript, and Web Crypto API
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>🔒 Client-side encryption</span>
              <span>🛡️ Zero-knowledge architecture</span>
              <span>⚡ Modern web standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
