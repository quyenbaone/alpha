import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'rentgear' }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Enhanced retry operation with better error handling and logging
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 10000); // 10 second timeout
      });

      // Race between the operation and timeout
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, {
        error,
        attempt,
        maxRetries,
        nextRetryDelay: attempt < maxRetries ? baseDelay * attempt : null
      });

      // Check for specific error types
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error detected:', {
          url: supabaseUrl,
          attempt,
          maxRetries
        });
      }

      // Only wait if we're going to retry
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 200;
        const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  const enhancedError = new Error(
    lastError?.message || 'Operation failed after multiple retries'
  );
  enhancedError.cause = lastError;
  throw enhancedError;
};

// Helper to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('users').select('id').limit(1);
    const duration = Date.now() - start;

    if (error) {
      console.error('Supabase connection check failed:', {
        error,
        duration,
        url: supabaseUrl
      });
      return false;
    }

    console.log('Supabase connection successful:', {
      duration,
      url: supabaseUrl
    });
    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
};