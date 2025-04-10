/*
  # Add renter role to users table

  1. Changes
    - Add is_renter column to users table
    - Add renter-specific policies
    - Update existing policies to include renter role

  2. Security
    - Maintain existing RLS policies
    - Add new policies for renter access
*/

-- Add is_renter column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_renter boolean DEFAULT false;

-- Create index for renter status
CREATE INDEX IF NOT EXISTS users_renter_idx ON users (is_renter);

-- Update RLS policies for equipment table to include renter access
DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
CREATE POLICY "Renters can insert their own equipment"
ON equipment
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_renter = true OR is_admin = true)
  )
);

DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
CREATE POLICY "Renters can update their own equipment"
ON equipment
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_renter = true OR is_admin = true)
  )
)
WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_renter = true OR is_admin = true)
  )
);

DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;
CREATE POLICY "Renters can delete their own equipment"
ON equipment
FOR DELETE
TO authenticated
USING (
  auth.uid() = owner_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (is_renter = true OR is_admin = true)
  )
);

-- Add function to handle renter verification
CREATE OR REPLACE FUNCTION verify_renter()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_renter = true AND OLD.is_renter = false THEN
    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      type,
      content,
      related_id
    ) VALUES (
      NEW.id,
      'rental_status',
      'Tài khoản của bạn đã được cấp quyền cho thuê thiết bị',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for renter verification
CREATE TRIGGER on_renter_verification
  AFTER UPDATE OF is_renter ON users
  FOR EACH ROW
  WHEN (OLD.is_renter IS DISTINCT FROM NEW.is_renter)
  EXECUTE FUNCTION verify_renter();

-- Update admin audit log function to include renter changes
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action,
      target_table,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW),
        'changed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;