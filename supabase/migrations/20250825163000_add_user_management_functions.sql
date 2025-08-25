

-- Add user management functions for admin operations
-- Function to add a user to whitelist (admin only)
CREATE OR REPLACE FUNCTION public.add_whitelisted_user(
  user_email TEXT,
  user_name TEXT,
  user_role app_role DEFAULT 'student'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
  result JSONB;
BEGIN
  -- Check if the current user is an admin
  SELECT id INTO admin_user_id
  FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin';
  
  IF admin_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only administrators can add whitelisted users'
    );
  END IF;
  
  -- Check if user already exists in whitelist
  IF EXISTS (SELECT 1 FROM public.whitelisted_users WHERE email = user_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is already whitelisted'
    );
  END IF;
  
  -- Add user to whitelist
  INSERT INTO public.whitelisted_users (email, name, role, added_by, added_at)
  VALUES (user_email, user_name, user_role, admin_user_id, now());
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User added to whitelist successfully',
    'email', user_email,
    'name', user_name,
    'role', user_role
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to register a whitelisted user (anyone with anon key)
CREATE OR REPLACE FUNCTION public.register_whitelisted_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  whitelisted_user RECORD;
  result JSONB;
BEGIN
  -- Check if user is whitelisted
  SELECT * INTO whitelisted_user
  FROM public.whitelisted_users
  WHERE email = user_email AND is_active = true;
  
  IF whitelisted_user IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is not whitelisted or whitelist is inactive'
    );
  END IF;
  
  -- Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already exists'
    );
  END IF;
  
  -- Mark whitelisted user as ready for registration
  UPDATE public.whitelisted_users
  SET is_registered = false, registered_at = NULL
  WHERE email = user_email;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User is whitelisted and ready for registration. Please use Supabase Auth signup.',
    'email', user_email,
    'name', whitelisted_user.name,
    'role', whitelisted_user.role
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_whitelisted_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_whitelisted_user() TO anon;

-- Create whitelisted_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.whitelisted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  registered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on whitelisted_users
ALTER TABLE public.whitelisted_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whitelisted_users
CREATE POLICY "Admins can view all whitelisted users"
  ON public.whitelisted_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage whitelisted users"
  ON public.whitelisted_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_whitelisted_users_updated_at
  BEFORE UPDATE ON public.whitelisted_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
