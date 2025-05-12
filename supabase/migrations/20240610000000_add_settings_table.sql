-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_logo TEXT,
    default_language TEXT DEFAULT 'vi',
    facebook_link TEXT,
    currency TEXT DEFAULT 'VNĐ',
    rental_time_unit TEXT DEFAULT 'day',
    allow_user_equipment_creation BOOLEAN DEFAULT TRUE,
    auto_email_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to create settings table via RPC
CREATE OR REPLACE FUNCTION public.create_settings_table()
RETURNS VOID AS $$
BEGIN
    -- Create settings table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.settings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        site_logo TEXT,
        default_language TEXT DEFAULT 'vi',
        facebook_link TEXT,
        currency TEXT DEFAULT 'VNĐ',
        rental_time_unit TEXT DEFAULT 'day',
        allow_user_equipment_creation BOOLEAN DEFAULT TRUE,
        auto_email_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow public access to the function
GRANT EXECUTE ON FUNCTION public.create_settings_table() TO PUBLIC;

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.settings FOR SELECT
USING (true);

-- Create policy to only allow admins to update settings
CREATE POLICY "Only admins can modify settings"
ON public.settings FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create policy to only allow admins to update settings (alternative with users table)
CREATE POLICY "Only admins can modify settings via users table"
ON public.settings FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = TRUE
)); 