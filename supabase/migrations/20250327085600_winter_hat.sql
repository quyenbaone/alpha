/*
  # Add admin features and policies

  1. Changes
    - Add admin-specific columns to users table
    - Add admin policies for equipment and rentals
    - Add admin audit log table

  2. Security
    - Add RLS policies for admin access to all tables
*/

-- Add last_login column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id),
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_audit_logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for admin audit logs
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  ));

CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  ));

-- Add admin policies for equipment table
CREATE POLICY "Admins can manage all equipment"
  ON equipment
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  ));

-- Add admin policies for rentals table
CREATE POLICY "Admins can manage all rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  ));

-- Function to update user's last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET last_login = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
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
      row_to_json(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for admin action logging
CREATE TRIGGER log_equipment_changes
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER log_rental_changes
  AFTER INSERT OR UPDATE OR DELETE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();