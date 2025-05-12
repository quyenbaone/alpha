-- Create User Preferences table
-- Run this script in your Supabase SQL Editor

-- Check if users table exists and create user_preferences table if it does
DO $$
DECLARE
    users_exist BOOLEAN;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) INTO users_exist;

    IF users_exist THEN
        -- Create user_preferences table
        CREATE TABLE IF NOT EXISTS public.user_preferences (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            notify_new_rentals BOOLEAN DEFAULT false,
            notify_rental_updates BOOLEAN DEFAULT false,
            theme TEXT DEFAULT 'light',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
        );

        -- Enable Row Level Security
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        DO $$
        BEGIN
            -- Users can view their own preferences
            IF NOT EXISTS (
                SELECT FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view their own preferences'
            ) THEN
                CREATE POLICY "Users can view their own preferences" 
                ON public.user_preferences FOR SELECT
                USING (auth.uid() = user_id);
            END IF;

            -- Users can update their own preferences
            IF NOT EXISTS (
                SELECT FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update their own preferences'
            ) THEN
                CREATE POLICY "Users can update their own preferences"
                ON public.user_preferences FOR UPDATE 
                USING (auth.uid() = user_id);
            END IF;

            -- Users can insert their own preferences
            IF NOT EXISTS (
                SELECT FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can insert their own preferences'
            ) THEN
                CREATE POLICY "Users can insert their own preferences"
                ON public.user_preferences FOR INSERT
                WITH CHECK (auth.uid() = user_id);
            END IF;
        END;
        $$;

        -- Create or replace function for handling updated_at timestamp
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS set_updated_at ON public.user_preferences;
        CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.user_preferences
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

        RAISE NOTICE 'Successfully created user_preferences table';
    ELSE
        RAISE NOTICE 'Users table does not exist! Make sure your users table is correctly set up.';
    END IF;
END
$$; 