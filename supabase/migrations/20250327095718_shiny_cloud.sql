/*
  # Fix Admin User Creation

  This migration properly handles foreign key constraints while creating/updating
  the admin user. It ensures all references are updated before any deletions.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
DECLARE
  new_admin_id uuid;
  old_admin_id uuid;
BEGIN
  -- First check if admin exists in auth.users
  SELECT id INTO old_admin_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  -- Generate new admin ID if needed
  IF old_admin_id IS NULL THEN
    SELECT gen_random_uuid() INTO new_admin_id;
  ELSE
    new_admin_id := old_admin_id;
  END IF;

  -- Create or update admin in public.users first
  INSERT INTO public.users (
    id,
    email,
    created_at,
    is_admin,
    verified,
    full_name,
    last_login
  ) VALUES (
    new_admin_id,
    'admin@gmail.com',
    NOW(),
    true,
    true,
    'Admin User',
    NOW()
  ) ON CONFLICT (email) DO UPDATE
  SET 
    is_admin = true,
    verified = true,
    last_login = NOW(),
    id = new_admin_id
  RETURNING id INTO new_admin_id;

  -- Create or update admin in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_admin_id,
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}'
  ) ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
    updated_at = NOW();

  -- Update all references if admin ID changed
  IF old_admin_id IS NOT NULL AND old_admin_id != new_admin_id THEN
    -- Update equipment ownership
    UPDATE equipment
    SET owner_id = new_admin_id
    WHERE owner_id = old_admin_id;
    
    -- Update rentals
    UPDATE rentals
    SET renter_id = new_admin_id
    WHERE renter_id = old_admin_id;
    
    -- Update messages
    UPDATE messages
    SET sender_id = new_admin_id
    WHERE sender_id = old_admin_id;
    
    UPDATE messages
    SET receiver_id = new_admin_id
    WHERE receiver_id = old_admin_id;
    
    -- Update notifications
    UPDATE notifications
    SET user_id = new_admin_id
    WHERE user_id = old_admin_id;
    
    -- Update admin audit logs
    UPDATE admin_audit_logs
    SET admin_id = new_admin_id
    WHERE admin_id = old_admin_id;
  END IF;

END $$;

-- Verify admin user exists and has proper permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM users u
    JOIN auth.users au ON u.id = au.id
    WHERE u.email = 'admin@gmail.com' 
    AND u.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin user creation failed';
  END IF;
END $$;