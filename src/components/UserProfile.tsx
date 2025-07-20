
import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });

      fetchProfile();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out."
    });
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">
          {profile.full_name || profile.email}
        </span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-800 border-gray-600 text-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <Button
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-gray-300 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserProfile;
