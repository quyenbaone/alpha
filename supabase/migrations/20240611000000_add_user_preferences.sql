-- Add User Preferences table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
        CREATE TABLE public.user_preferences (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) NOT NULL,
            notify_new_rentals BOOLEAN DEFAULT false,
            notify_rental_updates BOOLEAN DEFAULT false,
            theme TEXT DEFAULT 'light',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
        );

        -- Enable RLS
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

        -- Add policies
        CREATE POLICY "Users can view their own preferences" 
            ON public.user_preferences FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own preferences"
            ON public.user_preferences FOR UPDATE 
            USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can insert their own preferences"
            ON public.user_preferences FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Create trigger for updated_at
        CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.user_preferences
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END
$$; 