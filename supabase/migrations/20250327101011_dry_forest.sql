-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop all existing objects first
DO $$ 
BEGIN
  -- Drop triggers if they exist
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
  DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
  DROP TRIGGER IF EXISTS on_new_message ON messages;
  DROP TRIGGER IF EXISTS on_rental_status_change ON rentals;
  DROP TRIGGER IF EXISTS log_equipment_changes ON equipment;
  DROP TRIGGER IF EXISTS log_rental_changes ON rentals;

  -- Drop functions if they exist
  DROP FUNCTION IF EXISTS handle_user_crud() CASCADE;
  DROP FUNCTION IF EXISTS create_message_notification() CASCADE;
  DROP FUNCTION IF EXISTS create_rental_notification() CASCADE;
  DROP FUNCTION IF EXISTS log_admin_action() CASCADE;

  -- Drop tables in correct order
  DROP TABLE IF EXISTS admin_audit_logs CASCADE;
  DROP TABLE IF EXISTS notifications CASCADE;
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS rentals CASCADE;
  DROP TABLE IF EXISTS equipment CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
END $$;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_admin boolean DEFAULT false,
  last_login timestamptz,
  full_name text,
  phone_number text,
  address text,
  avatar_url text,
  bio text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  verified boolean DEFAULT false
);

-- Create equipment table
CREATE TABLE equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  image text NOT NULL,
  location text NOT NULL,
  owner_id uuid REFERENCES users(id) NOT NULL,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) NOT NULL,
  renter_id uuid REFERENCES users(id) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) NOT NULL,
  receiver_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('message', 'rental_request', 'rental_status')),
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  related_id uuid
);

-- Create admin audit logs table
CREATE TABLE admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id),
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX users_phone_number_idx ON users (phone_number);
CREATE INDEX users_verified_idx ON users (verified);

-- Create RLS policies
CREATE POLICY "Users can read basic profile info" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do everything" ON users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Equipment policies
CREATE POLICY "Anyone can view equipment" ON equipment
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert their own equipment" ON equipment
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own equipment" ON equipment
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own equipment" ON equipment
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Rental policies
CREATE POLICY "Users can view their own rentals" ON rentals
  FOR SELECT TO authenticated
  USING (auth.uid() = renter_id);

CREATE POLICY "Equipment owners can view rentals of their equipment" ON rentals
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM equipment
    WHERE equipment.id = rentals.equipment_id
    AND equipment.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create rental requests" ON rentals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_id AND status = 'pending');

CREATE POLICY "Equipment owners can update rental status" ON rentals
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM equipment
    WHERE equipment.id = rentals.equipment_id
    AND equipment.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM equipment
    WHERE equipment.id = rentals.equipment_id
    AND equipment.owner_id = auth.uid()
  ));

-- Message policies
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages they send" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Notification policies
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin audit log policies
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create functions
CREATE OR REPLACE FUNCTION handle_user_crud()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.users
    SET email = NEW.email,
        last_login = NEW.last_sign_in_at
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, related_id)
  VALUES (
    NEW.receiver_id,
    'message',
    'New message from ' || (SELECT email FROM users WHERE id = NEW.sender_id),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_rental_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, content, related_id)
    VALUES (
      NEW.renter_id,
      'rental_status',
      'Your rental request has been ' || NEW.status,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
      row_to_json(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_crud();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_crud();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_crud();

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

CREATE TRIGGER on_rental_status_change
  AFTER UPDATE ON rentals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_rental_notification();

CREATE TRIGGER log_equipment_changes
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER log_rental_changes
  AFTER INSERT OR UPDATE OR DELETE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();