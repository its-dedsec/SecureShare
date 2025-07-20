
import React from 'react';
import { Shield, Key, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SecurityInfo = () => {
  return (
    <Card className="p-6 bg-gray-900 border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Security Overview</h2>
      </div>

      <div className="space-y-6">
        <Alert className="bg-green-900/20 border-green-700">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            Your files are protected with military-grade AES-256-GCM encryption
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">AES-256-GCM Encryption</h3>
              <p className="text-gray-400 text-sm">
                Industry-standard encryption with authenticated encryption providing both confidentiality and integrity protection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">PBKDF2 Key Derivation</h3>
              <p className="text-gray-400 text-sm">
                Your password is strengthened using 100,000 iterations of PBKDF2 with SHA-256 and cryptographically secure random salts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">Client-Side Processing</h3>
              <p className="text-gray-400 text-sm">
                All encryption and decryption happens in your browser. Your passwords and decrypted files never leave your device.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-3">Security Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              AES-256-GCM authenticated encryption
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              PBKDF2 key derivation (100,000 iterations)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Cryptographically secure random IVs and salts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              SHA-256 file integrity verification
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Client-side encryption (zero-knowledge)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Secure local storage in IndexedDB
            </li>
          </ul>
        </div>

        <Alert className="bg-yellow-900/20 border-yellow-700">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <strong>Important:</strong> If you forget your password, your files cannot be recovered. 
            The encryption is designed to be unbreakable, even by us.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};

export default SecurityInfo;
