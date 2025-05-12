import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, SettingsType, getSettings, updateSettings } from '../lib/services/settings';

interface SettingsStore {
    settings: SettingsType;
    loading: boolean;
    error: string | null;
    initialized: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: SettingsType) => Promise<boolean>;
}

// Create a store with persistence for faster loading
export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            settings: DEFAULT_SETTINGS,
            loading: false,
            error: null,
            initialized: false,

            fetchSettings: async () => {
                // Skip if already initialized and not loading
                if (get().initialized && !get().loading) return;

                // Set a timeout to prevent blocking the UI
                const timeoutPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        // If this resolves first, we'll use cached settings
                        if (get().loading) {
                            console.info('Using cached settings while fetching from server');
                            set({ loading: false, initialized: true });
                        }
                        resolve();
                    }, 5000); // 5 second timeout
                });

                set({ loading: true, error: null });

                try {
                    // Race between the actual fetch and the timeout
                    await Promise.race([
                        // The actual settings fetch
                        getSettings().then(data => {
                            set({ settings: data, loading: false, initialized: true });
                        }),
                        timeoutPromise
                    ]);
                } catch (error) {
                    console.error('Error fetching settings:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load settings',
                        loading: false,
                        // Still mark as initialized so we can proceed with the app
                        initialized: true
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
        }),
        {
            name: 'app-settings',
            partialize: (state) => ({ settings: state.settings }),
        }
    )
); 