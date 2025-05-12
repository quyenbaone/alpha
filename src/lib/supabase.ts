import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Check for cached session on page load (before Supabase client init)
// This helps prevent the loading delay when refreshing
const checkForCachedSession = () => {
  try {
    const cachedSession = localStorage.getItem('supabase-auth');
    if (cachedSession) {
      const parsedSession = JSON.parse(cachedSession);
      // If session exists and isn't expired, we can use it immediately
      if (parsedSession?.expiresAt && new Date(parsedSession.expiresAt) > new Date()) {
        console.log('Using cached session');
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking cached session:', error);
  }
  return false;
};

// Global fetch cache
const cachedResponses = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

// Performance optimized fetch
const optimizedFetch = (...args: Parameters<typeof fetch>) => {
  // Only cache GET requests
  if (args[1]?.method === 'GET' || !args[1]?.method) {
    const cacheKey = args[0].toString();
    const cached = cachedResponses.get(cacheKey);

    // Return cached data if it exists and is not expired
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      const responseClone = new Response(JSON.stringify(cached.data), {
        headers: new Headers({ 'Content-Type': 'application/json' })
      });
      return Promise.resolve(responseClone);
    }

    // If not cached or expired, fetch and cache
    return fetch(...args).then(response => {
      if (response.ok) {
        // Clone the response before consuming it
        const clone = response.clone();
        clone.json().then(data => {
          cachedResponses.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }).catch(() => {
          // If JSON parsing fails, don't cache
        });
      }
      return response;
    });
  }

  // For non-GET requests, use standard fetch
  return fetch(...args);
};

// Create client with optimized settings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth',
    flowType: 'pkce',
  },
  // Use optimized fetch for better performance
  global: {
    fetch: optimizedFetch,
    headers: {
      'X-Client-Info': 'rentgear@1.0.0',
    }
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Disable realtime subscriptions by default to improve performance
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Verify connection
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Supabase connection successful');
  }
});

// Pre-initialize auth status check
export const hasValidSession = checkForCachedSession();

// Cache utility to manually clear cache
export const clearSupabaseCache = () => {
  cachedResponses.clear();
};

// Custom hook for memoized queries
import { useCallback, useEffect, useState } from 'react';

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null, error: any }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await queryFn();
      if (error) {
        setError(error);
      } else {
        setData(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [queryFn, ...dependencies]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, error, loading, refetch: execute };
}