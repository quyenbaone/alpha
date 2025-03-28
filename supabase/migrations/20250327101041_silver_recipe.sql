-- Create initial admin user
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
      raw_user_meta_data
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
      '{}'
    );
  ELSE
    -- Update existing admin user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = admin_id;
  END IF;

  -- Create or update the public.users record
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

END $$;