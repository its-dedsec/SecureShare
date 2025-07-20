-- Create encrypted_files table to store files tied to user accounts
CREATE TABLE public.encrypted_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  encrypted_data BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  salt BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file_shares table for sharing files between users
CREATE TABLE public.file_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.encrypted_files(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_password TEXT, -- Optional password for additional security
  can_download BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(file_id, recipient_email)
);

-- Enable Row Level Security
ALTER TABLE public.encrypted_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for encrypted_files
CREATE POLICY "Users can view their own files" 
  ON public.encrypted_files 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" 
  ON public.encrypted_files 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
  ON public.encrypted_files 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
  ON public.encrypted_files 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for file_shares
CREATE POLICY "Users can view files shared with them" 
  ON public.file_shares 
  FOR SELECT 
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = recipient_id OR 
    (SELECT email FROM auth.users WHERE id = auth.uid()) = recipient_email
  );

CREATE POLICY "Users can create shares for their files" 
  ON public.file_shares 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (SELECT 1 FROM public.encrypted_files WHERE id = file_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own shares" 
  ON public.file_shares 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own shares" 
  ON public.file_shares 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- Create view for shared files accessible to users
CREATE VIEW public.accessible_files AS
SELECT 
  ef.*,
  fs.recipient_email,
  fs.access_password IS NOT NULL as requires_share_password,
  fs.expires_at,
  fs.id as share_id,
  CASE 
    WHEN ef.user_id = auth.uid() THEN 'owner'
    ELSE 'shared'
  END as access_type
FROM public.encrypted_files ef
LEFT JOIN public.file_shares fs ON ef.id = fs.file_id
WHERE 
  ef.user_id = auth.uid() OR 
  fs.recipient_id = auth.uid() OR 
  (SELECT email FROM auth.users WHERE id = auth.uid()) = fs.recipient_email;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_encrypted_files_updated_at
    BEFORE UPDATE ON public.encrypted_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_encrypted_files_user_id ON public.encrypted_files(user_id);
CREATE INDEX idx_file_shares_recipient_email ON public.file_shares(recipient_email);
CREATE INDEX idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX idx_file_shares_expires_at ON public.file_shares(expires_at) WHERE expires_at IS NOT NULL;