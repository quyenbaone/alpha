import { create } from 'zustand';
import { DEFAULT_SETTINGS, SettingsType, getSettings, updateSettings } from '../lib/services/settings';

interface SettingsStore {
    settings: SettingsType;
    loading: boolean;
    error: string | null;
    initialized: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: SettingsType) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    loading: false,
    error: null,
    initialized: false,

    fetchSettings: async () => {
        // Skip if already initialized and not loading
        if (get().initialized && !get().loading) return;

        set({ loading: true, error: null });
        try {
            const data = await getSettings();
            set({ settings: data, loading: false, initialized: true });
        } catch (error) {
            console.error('Error fetching settings:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to load settings',
                loading: false,
            });
        }
    },

    updateSettings: async (newSettings: SettingsType) => {
        set({ loading: true, error: null });
        try {
            const success = await updateSettings(newSettings);
            if (success) {
                set({ settings: newSettings, loading: false });
            }
            return success;
        } catch (error) {
            console.error('Error updating settings:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to update settings',
                loading: false,
            });
            return false;
        }
    },
})); 