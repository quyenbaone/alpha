/*
  # Create admin user

  1. Changes
    - Update admin status for specified user
    - Add RLS policies for admin access

  2. Security
    - Enable RLS on users table
    - Add policies for admin access
*/

-- Update admin status for the specified user
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@gmail.com';

-- Add RLS policies for admin access
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (is_admin = true) OR 
    (auth.uid() = id)
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin = true)
  WITH CHECK (is_admin = true);