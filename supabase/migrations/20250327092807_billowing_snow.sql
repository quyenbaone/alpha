/*
  # Enhance users table with personal information

  1. Changes
    - Add personal information fields to users table:
      - full_name (text)
      - phone_number (text)
      - address (text)
      - avatar_url (text)
      - bio (text)
      - date_of_birth (date)
      - gender (text)
      - verified (boolean)

  2. Security
    - Maintain existing RLS policies
    - Add new policy for users to read basic profile info of other users
*/

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Drop existing policies to update them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read all users" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
  DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create updated policies
CREATE POLICY "Users can read basic profile info"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do everything"
  ON public.users
  FOR ALL
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

-- Update admin user with sample data
UPDATE public.users
SET 
  full_name = 'Admin User',
  verified = true
WHERE email = 'admin@gmail.com';

-- Create index for phone number searches
CREATE INDEX IF NOT EXISTS users_phone_number_idx ON public.users (phone_number);

-- Create index for verified status
CREATE INDEX IF NOT EXISTS users_verified_idx ON public.users (verified);