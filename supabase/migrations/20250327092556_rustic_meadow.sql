/*
  # Authentication and Role Management Setup

  1. New Tables
    - `public.users`
      - `id` (uuid, primary key) - matches Supabase auth.users id
      - `email` (text, unique)
      - `created_at` (timestamp with time zone)
      - `is_admin` (boolean)
      - `last_login` (timestamp with time zone)

  2. Security
    - Enable RLS on users table
    - Add policies for user access control
    - Add trigger for updating last_login

  3. Functions
    - Create function to update last login timestamp
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read all users" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
  DROP POLICY IF EXISTS "Admins can do everything" ON public.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Drop existing trigger and function with CASCADE
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;
  DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;
  DROP FUNCTION IF EXISTS public.update_last_login() CASCADE;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own data"
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

-- Create function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET last_login = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$;

-- Create trigger for last login update
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_login();

-- Insert initial admin user with conflict handling for both id and email
INSERT INTO public.users (id, email, is_admin, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@gmail.com',
  true,
  now()
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true, id = '00000000-0000-0000-0000-000000000000';