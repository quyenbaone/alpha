-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    address TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT,
    verified BOOLEAN DEFAULT FALSE
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Insert sample users if they don't exist in the users table yet
INSERT INTO public.users (id, email, full_name, is_admin, role, created_at, verified)
SELECT 
    id, 
    email, 
    'Admin User',
    TRUE, 
    'admin', 
    NOW(), 
    TRUE
FROM auth.users 
WHERE email = 'admin_new@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin_new@gmail.com'
);

INSERT INTO public.users (id, email, full_name, is_admin, role, created_at, verified)
SELECT 
    id, 
    email, 
    'Sample Owner',
    FALSE, 
    'owner', 
    NOW(), 
    TRUE
FROM auth.users 
WHERE email = 'owner_new@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'owner_new@gmail.com'
);

INSERT INTO public.users (id, email, full_name, is_admin, role, created_at, verified)
SELECT 
    id, 
    email, 
    'Sample Renter',
    FALSE, 
    'renter', 
    NOW(), 
    TRUE
FROM auth.users 
WHERE email = 'renter_new@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'renter_new@gmail.com'
); 