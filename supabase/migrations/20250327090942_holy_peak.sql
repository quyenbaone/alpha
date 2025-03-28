/*
  # Fix Admin User Creation and Authentication

  1. Changes
    - Create admin user with proper password hashing
    - Update RLS policies
    - Enable row level security
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin user if not exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- First try to get existing admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  -- If admin user doesn't exist, create it
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users and get the new id
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;
  ELSE
    -- Update existing admin user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      updated_at = NOW()
    WHERE id = admin_user_id;
  END IF;

  -- Now create or update the public.users record
  INSERT INTO public.users (
    id,
    email,
    created_at,
    is_admin,
    last_login
  ) VALUES (
    admin_user_id,
    'admin@gmail.com',
    NOW(),
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    is_admin = true,
    last_login = NOW();

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