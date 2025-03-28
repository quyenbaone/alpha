/*
  # Update user management and triggers

  1. Changes:
    - Create function to handle user CRUD operations
    - Set up triggers for auth user changes
    - Update RLS policies with proper conflict handling
    
  2. Security:
    - Enable RLS on users table
    - Add policies for user access control
    - Ensure admin access is properly configured
*/

-- Create function to handle user creation/updates
CREATE OR REPLACE FUNCTION public.handle_user_crud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (
      id,
      email,
      created_at,
      is_admin,
      verified
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.created_at,
      false,
      false
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      created_at = EXCLUDED.created_at;
    
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.users
    SET 
      email = NEW.email,
      last_login = NEW.last_sign_in_at
    WHERE id = NEW.id;
    
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users
    WHERE id = OLD.id;
    
    RETURN OLD;
  END IF;
END;
$$;

-- Create triggers for auth user changes
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_crud();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_crud();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_crud();

-- Update RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read basic profile info" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
  DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can read basic profile info"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do everything"
ON public.users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update admin user if exists
UPDATE public.users
SET 
  is_admin = true,
  verified = true,
  full_name = 'Admin User'
WHERE email = 'admin@gmail.com';