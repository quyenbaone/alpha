# How to Fix the User Role and Display Issues

The problem is that your new Supabase project doesn't have the required database tables. You need to run the migration script to create all the necessary tables.

## Option 1: Run SQL in Supabase Dashboard

1. Log into your Supabase dashboard: https://app.supabase.com/project/bfueidgbnbggvlczwecz
2. Go to SQL Editor
3. Copy the content from `create-users-table.sql`
4. Run the SQL

## Option 2: Run the Full Migration Script

For a complete setup, you can run the full migration script located at:
`supabase/migrations/20240320000000_initial_schema.sql`

You can run this using the SQL Editor in the Supabase dashboard.

## Option 3: Recreate Specific Users

If you just want the three test users to work properly, run this SQL in the Supabase dashboard SQL Editor:

```sql
-- Create users table if it doesn't exist
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

-- Insert user profiles for existing auth users
INSERT INTO public.users (id, email, full_name, is_admin, role, created_at, verified)
SELECT 
    id, 
    raw_user_meta_data->>'email', 
    CASE
        WHEN raw_user_meta_data->>'email' = 'admin_new@gmail.com' THEN 'Admin User'
        WHEN raw_user_meta_data->>'email' = 'owner_new@gmail.com' THEN 'Sample Owner'
        WHEN raw_user_meta_data->>'email' = 'renter_new@gmail.com' THEN 'Sample Renter'
        ELSE 'User'
    END,
    CASE
        WHEN raw_user_meta_data->>'email' = 'admin_new@gmail.com' THEN TRUE
        ELSE FALSE
    END,
    CASE
        WHEN raw_user_meta_data->>'email' = 'admin_new@gmail.com' THEN 'admin'
        WHEN raw_user_meta_data->>'email' = 'owner_new@gmail.com' THEN 'owner'
        WHEN raw_user_meta_data->>'email' = 'renter_new@gmail.com' THEN 'renter'
        ELSE 'renter'
    END,
    NOW(), 
    TRUE
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.users.id
);
```

After running this SQL, you should be able to log in with the sample accounts and have the proper roles and user information displayed. 