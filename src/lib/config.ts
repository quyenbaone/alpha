// API Configuration
export const API_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiPath: '/functions/v1/api',
} as const;

// Construct full API URL
export const API_URL = `${API_CONFIG.url}${API_CONFIG.apiPath}`;