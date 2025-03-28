-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update admin user password and ensure email confirmation
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get the admin user ID from auth.users
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  IF admin_id IS NULL THEN
    -- Get ID from public.users as fallback
    SELECT id INTO admin_id
    FROM public.users
    WHERE email = 'admin@gmail.com';
    
    IF admin_id IS NULL THEN
      RAISE EXCEPTION 'Admin user not found in either auth.users or public.users';
    END IF;
  END IF;

  -- Ensure admin exists in public.users first
  INSERT INTO public.users (
    id,
    email,
    created_at,
    is_admin,
    verified,
    full_name,
    last_login
  ) VALUES (
    admin_id,
    'admin@gmail.com',
    NOW(),
    true,
    true,
    'Admin User',
    NOW()
  ) ON CONFLICT (id) DO UPDATE
  SET 
    is_admin = true,
    verified = true,
    last_login = NOW();

  -- Update password and ensure email is confirmed in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = admin_id;

  -- Verify the update was successful
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = admin_id 
    AND encrypted_password IS NOT NULL
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Failed to update admin user in auth.users';
  END IF;

  -- Only log after ensuring user exists in both tables
  IF EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = admin_id 
    AND is_admin = true
  ) THEN
    INSERT INTO admin_audit_logs (
      admin_id,
      action,
      target_table,
      target_id,
      details
    ) VALUES (
      admin_id,
      'UPDATE',
      'auth.users',
      admin_id,
      jsonb_build_object(
        'type', 'password_update',
        'timestamp', NOW()
      )
    );
  END IF;

END $$;