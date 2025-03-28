-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin user with proper credentials
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- First try to get existing admin user id
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  -- If admin user doesn't exist, create it
  IF admin_id IS NULL THEN
    -- Generate new admin ID
    admin_id := gen_random_uuid();

    -- Create in auth.users first
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
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      true
    );

    -- Create in public.users
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
    );
  ELSE
    -- Update existing admin user
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      is_super_admin = true
    WHERE id = admin_id;

    -- Update in public.users
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
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      is_admin = true,
      verified = true,
      last_login = NOW();
  END IF;
END $$;

-- Verify admin user exists and has proper permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.users p ON u.id = p.id
    WHERE u.email = 'admin@gmail.com' 
    AND p.is_admin = true
    AND u.is_super_admin = true
  ) THEN
    RAISE EXCEPTION 'Admin user creation failed';
  END IF;
END $$;