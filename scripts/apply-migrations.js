// Script to run the user_preferences table migration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    try {
        console.log('Checking if users table exists...');

        // First, let's check if we need to fix the reference to profiles
        const { data: usersTableExists, error: usersTableError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (usersTableError && usersTableError.code === '42P01') {
            console.error('Users table does not exist:', usersTableError);
            return;
        }

        // Read the migration file
        const migrationPath = path.resolve('supabase/migrations/20240611000000_add_user_preferences.sql');
        let migrationSql = fs.readFileSync(migrationPath, 'utf8');

        // If users table exists but profiles doesn't, modify the migration
        if (usersTableExists) {
            console.log('Users table exists, checking profiles table...');
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (profilesError && profilesError.code === '42P01') {
                console.log('Profiles table does not exist, modifying migration to use users table instead');
                migrationSql = migrationSql.replace('REFERENCES public.profiles(id)', 'REFERENCES public.users(id)');
            }
        }

        // Execute the migration
        console.log('Running user_preferences migration...');
        const { error } = await supabase.rpc('pgcode', { code: migrationSql });

        if (error) {
            console.error('Error running migration:', error);
            return;
        }

        console.log('Migration successful! user_preferences table has been created.');
    } catch (error) {
        console.error('Error:', error);
    }
}

runMigration(); 