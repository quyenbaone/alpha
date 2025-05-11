-- Tạo bảng users nếu chưa tồn tại
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

-- Bật bảo mật theo hàng
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Tạo các chính sách bảo mật
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Chèn thông tin người dùng với tên tiếng Việt
INSERT INTO public.users (id, email, full_name, is_admin, role, created_at, verified)
SELECT 
    id, 
    raw_user_meta_data->>'email', 
    CASE
        WHEN raw_user_meta_data->>'email' = 'admin_new@gmail.com' THEN 'Quản trị viên'
        WHEN raw_user_meta_data->>'email' = 'owner_new@gmail.com' THEN 'Chủ nhà'
        WHEN raw_user_meta_data->>'email' = 'renter_new@gmail.com' THEN 'Người thuê'
        ELSE 'Người dùng'
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

-- Cập nhật thông tin người dùng hiện tại sang tiếng Việt
UPDATE public.users
SET full_name = 'Quản trị viên'
WHERE email = 'admin_new@gmail.com';

UPDATE public.users
SET full_name = 'Người cho thuê'
WHERE email = 'owner_new@gmail.com';

UPDATE public.users
SET full_name = 'Người thuê'
WHERE email = 'renter_new@gmail.com'; 