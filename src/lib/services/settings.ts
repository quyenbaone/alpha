import { toast } from 'sonner';
import { supabase } from '../supabase';

export interface SettingsType {
    id?: string;
    site_logo: string;
    site_name: string;
    contact_address: string;
    contact_phone: string;
    contact_email: string;
    default_language: string;
    facebook_link: string;
    currency: string;
    rental_time_unit: string;
    allow_user_equipment_creation: boolean;
    auto_email_notifications: boolean;
    created_at?: string;
    updated_at?: string;
}

export const DEFAULT_SETTINGS: SettingsType = {
    site_logo: '',
    site_name: 'Alpha',
    contact_address: 'Quy Nhơn, Bình Định',
    contact_phone: '(84) 123 456 789',
    contact_email: 'contact@alpha.com',
    default_language: 'vi',
    facebook_link: '',
    currency: 'VNĐ',
    rental_time_unit: 'day',
    allow_user_equipment_creation: true,
    auto_email_notifications: true,
};

// Initialize cache for settings
let settingsCache: SettingsType | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches system settings from Supabase
 * Uses caching to minimize database calls
 */
export async function getSettings(): Promise<SettingsType> {
    const now = Date.now();

    // Use cached settings if available and not expired
    if (settingsCache && (now - lastFetchTime < CACHE_TTL)) {
        return settingsCache;
    }

    try {
        // Check if the settings table exists, if not create it
        const { error: tableError } = await supabase
            .from('settings')
            .select('id')
            .limit(1);

        if (tableError) {
            // Table might not exist, try to create it
            await createSettingsTable();
        }

        // Fetch settings
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            // Add missing properties from DEFAULT_SETTINGS if they don't exist
            const mergedSettings = { ...DEFAULT_SETTINGS, ...data[0] };
            settingsCache = mergedSettings;
            lastFetchTime = now;
            return mergedSettings;
        } else {
            // No settings found, create default settings
            await createDefaultSettings();
            return DEFAULT_SETTINGS;
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        // If we can't fetch settings, return defaults
        return DEFAULT_SETTINGS;
    }
}

/**
 * Creates the settings table if it doesn't exist
 */
export async function createSettingsTable(): Promise<void> {
    try {
        // Create settings table using SQL
        const { error } = await supabase.rpc('create_settings_table');

        if (error) {
            console.error('Error creating settings table:', error);
        }
    } catch (error) {
        console.error('Error creating settings table:', error);
    }
}

/**
 * Creates default settings in the database
 */
export async function createDefaultSettings(): Promise<void> {
    try {
        const { error } = await supabase
            .from('settings')
            .insert([DEFAULT_SETTINGS]);

        if (error) throw error;

        // Update cache
        settingsCache = DEFAULT_SETTINGS;
        lastFetchTime = Date.now();
    } catch (error) {
        console.error('Error creating default settings:', error);
    }
}

/**
 * Updates system settings
 */
export async function updateSettings(settings: SettingsType): Promise<boolean> {
    try {
        // Clear cache to force a refresh
        settingsCache = null;

        const { error } = await supabase
            .from('settings')
            .upsert([settings]);

        if (error) throw error;

        // Update cache
        settingsCache = settings;
        lastFetchTime = Date.now();

        return true;
    } catch (error) {
        console.error('Error updating settings:', error);
        toast.error('Lỗi khi cập nhật cài đặt');
        return false;
    }
} 