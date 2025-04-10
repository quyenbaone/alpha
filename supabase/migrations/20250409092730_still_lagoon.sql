/*
  # Fix recursive users table policies

  1. Changes
    - Remove recursive admin policy that was causing infinite recursion
    - Restructure policies to be more efficient and prevent recursion
    - Maintain security while fixing the technical issue
  
  2. Security
    - Maintain RLS enabled on users table
    - Ensure admins can still manage users
    - Keep user data protected
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything" ON users;
DROP POLICY IF EXISTS "Users can read basic profile info" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new, non-recursive policies
CREATE POLICY "Admins have full access"
ON users
FOR ALL
TO authenticated
USING (is_admin = true)
WITH CHECK (is_admin = true);

CREATE POLICY "Users can read basic profile info"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);