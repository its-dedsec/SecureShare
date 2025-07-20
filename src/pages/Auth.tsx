
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileKey, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in."
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.fullName);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account."
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileKey className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SecureShare</h1>
          <p className="text-gray-400">Access your encrypted files</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpForm.fullName}
                    onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    placeholder="Choose a password (min 6 chars)"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-confirm" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Creating account...' : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
