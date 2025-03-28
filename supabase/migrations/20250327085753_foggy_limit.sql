/*
  # Create admin test account

  1. Changes
    - Create admin user account for testing
    - Set admin privileges
*/

-- Insert admin user if not exists
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gmail.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com'
);

-- Create corresponding user record in public.users table
INSERT INTO public.users (
  id,
  email,
  created_at,
  is_admin
)
SELECT
  id,
  email,
  created_at,
  true
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;