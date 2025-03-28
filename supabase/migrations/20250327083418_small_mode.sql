/*
  # Add admin role functionality

  1. Changes
    - Add is_admin column to users table
    - Add policies for admin users
    - Create function to set up admin users

  2. Security
    - Admins get full access to all tables through policies
    - Regular users retain their existing permissions
*/

DO $$ 
BEGIN
  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can do everything" ON users;
  DROP POLICY IF EXISTS "Admins can do everything with equipment" ON equipment;
  DROP POLICY IF EXISTS "Admins can do everything with rentals" ON rentals;
  DROP POLICY IF EXISTS "Admins can do everything with messages" ON messages;
  DROP POLICY IF EXISTS "Admins can do everything with notifications" ON notifications;
END $$;

-- Create new admin policies
CREATE POLICY "Admins can do everything"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can do everything with equipment"
  ON equipment
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can do everything with rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can do everything with messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins can do everything with notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

-- Function to set up admin user
CREATE OR REPLACE FUNCTION setup_admin_user(admin_email text)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET is_admin = true
  WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql;