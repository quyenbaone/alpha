/*
  # Add admin management functions and policies

  1. New Functions
    - `toggle_admin_status`: Allows admins to safely toggle admin status of users
  
  2. Security
    - Add policy for admin management
    - Update RLS policies for user management
*/

-- Create function to toggle admin status
CREATE OR REPLACE FUNCTION toggle_admin_status(target_user_id uuid, new_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the executing user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can modify admin status';
  END IF;

  -- Update the target user's admin status
  UPDATE users 
  SET is_admin = new_status
  WHERE id = target_user_id;
END;
$$;

-- Update RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read basic profile info" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;

-- Recreate policies with proper permissions
CREATE POLICY "Users can read basic profile info"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage users"
ON users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND is_admin = true
  )
);