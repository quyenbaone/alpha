-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- First check if admin user exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@gmail.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    -- Create new admin user in auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      'admin@gmail.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO admin_user_id;
  ELSE
    -- Update existing admin user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      updated_at = now(),
      email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = admin_user_id;
  END IF;

  -- Create or update the public.users record
  INSERT INTO public.users (
    id,
    email,
    created_at,
    is_admin,
    last_login
  ) VALUES (
    admin_user_id,
    'admin@gmail.com',
    now(),
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    is_admin = true,
    last_login = now();

END $$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can do everything" ON public.users;

-- Allow all authenticated users to read user data
CREATE POLICY "Users can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins full access to user data
CREATE POLICY "Admins can do everything"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );