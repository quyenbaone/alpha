// Script to create an admin user in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://bfueidgbnbggvlczwecz.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdWVpZGdibmJnZ3ZsY3p3ZWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk2NzU1OCwiZXhwIjoyMDYyNTQzNTU4fQ.62LjDqJJfp4aRl-eHft9ska95EtafWQfwLeKaEus0MY';

// Create a Supabase client with the service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAdminUser() {
    try {
        // 1. Create user with admin@example.com
        const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
            email: 'admin@example.com',
            password: 'admin@123',
            email_confirm: true, // Auto-confirm the email
        });

        if (signUpError) {
            console.error('Error creating user:', signUpError);
            return;
        }

        console.log('User created successfully:', userData);

        // 2. Insert the user profile with admin rights in the users table
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert({
                id: userData.user.id,
                email: 'admin@example.com',
                is_admin: true,
                full_name: 'Admin User',
                created_at: new Date().toISOString(),
                verified: true
            });

        if (profileError) {
            console.error('Error creating user profile:', profileError);
            return;
        }

        console.log('Admin user profile created successfully');
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Create additional sample users (owner and renter)
async function createSampleUsers() {
    try {
        // Create owner user
        const { data: ownerData, error: ownerError } = await supabase.auth.admin.createUser({
            email: 'owner_new@gmail.com',
            password: 'owner@123',
            email_confirm: true,
        });

        if (ownerError) {
            console.error('Error creating owner user:', ownerError);
        } else {
            console.log('Owner user created:', ownerData.user.id);

            // Create owner profile
            await supabase.from('users').insert({
                id: ownerData.user.id,
                email: 'owner_new@gmail.com',
                is_admin: false,
                role: 'owner',
                full_name: 'Sample Owner',
                created_at: new Date().toISOString(),
                verified: true
            });
        }

        // Create renter user
        const { data: renterData, error: renterError } = await supabase.auth.admin.createUser({
            email: 'renter_new@gmail.com',
            password: 'renter@123',
            email_confirm: true,
        });

        if (renterError) {
            console.error('Error creating renter user:', renterError);
        } else {
            console.log('Renter user created:', renterData.user.id);

            // Create renter profile
            await supabase.from('users').insert({
                id: renterData.user.id,
                email: 'renter_new@gmail.com',
                is_admin: false,
                role: 'renter',
                full_name: 'Sample Renter',
                created_at: new Date().toISOString(),
                verified: true
            });
        }

        console.log('Sample users created successfully');
    } catch (error) {
        console.error('Error creating sample users:', error);
    }
}

// Run the functions
createAdminUser()
    .then(() => createSampleUsers())
    .then(() => console.log('All done!'))
    .catch(err => console.error('Script failed:', err)); 