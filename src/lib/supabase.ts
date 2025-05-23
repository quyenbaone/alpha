import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Track if this tab is the active tab for realtime subscriptions
let isActiveTab = true;
let tabId = Math.random().toString(36).substring(2, 10);

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

// Track rate limited operations
const rateLimitedOperations = new Map<string, number>();
const RATE_LIMIT_WINDOW = 2 * 60 * 1000; // 2 minutes

// Clear expired rate limit tracking
setInterval(() => {
  const now = Date.now();
  rateLimitedOperations.forEach((timestamp, operation) => {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      rateLimitedOperations.delete(operation);
    }
  });
}, 60 * 1000); // Clean up every minute

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

  // For non-GET requests like POST/PUT (auth operations)
  const url = args[0].toString();
  const options = args[1] || {};
  const isAuthRequest = url.includes('/auth/v1/');
  const isEmailOperation = url.includes('/signup') || url.includes('/recover') || url.includes('/otp');

  // Add request metadata for debugging
  const requestInfo = {
    method: options.method || 'GET',
    url: url,
    timestamp: new Date().toISOString()
  };

  // Create operation key for tracking rate limits
  const operationKey = isEmailOperation ?
    `email:${getEmailFromBody(options.body)}` :
    `auth:${url.split('/').pop() || 'unknown'}`;

  // Helper to safely extract email from request body
  function getEmailFromBody(body: any): string {
    if (!body) return 'unknown';
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      return parsed.email || 'unknown';
    } catch (e) {
      console.error('Failed to parse request body', e);
      return 'unknown';
    }
  }

  // Check if this operation was recently rate limited
  if (isAuthRequest && rateLimitedOperations.has(operationKey)) {
    const timeSinceRateLimit = Date.now() - (rateLimitedOperations.get(operationKey) || 0);
    if (timeSinceRateLimit < RATE_LIMIT_WINDOW) {
      // Operation is still in cooldown period - simulate a rate limit response
      console.warn(`Operation ${operationKey} is in cooldown period. Remaining: ${Math.ceil((RATE_LIMIT_WINDOW - timeSinceRateLimit) / 1000)} seconds`);

      return Promise.resolve(new Response(JSON.stringify({
        error: "Client-side rate limit",
        message: "Too many requests for this operation. Please try again later.",
        status: 429
      }), {
        status: 429,
        headers: new Headers({
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((RATE_LIMIT_WINDOW - timeSinceRateLimit) / 1000).toString()
        })
      }));
    }
  }

  // Add delay for auth requests to avoid rate limiting
  if (isAuthRequest) {
    // Add longer delay for email operations which are more strictly rate limited
    const authDelay = isEmailOperation ?
      500 + (Math.random() * 1000) : // 500-1500ms for email operations
      Math.random() * 500; // 0-500ms for other auth operations

    return new Promise(resolve => setTimeout(resolve, authDelay))
      .then(() => fetch(...args)
        .then(response => {
          // Handle rate limiting
          if (response.status === 429) {
            console.warn('Rate limit hit:', requestInfo);
            // Record this operation as rate limited
            rateLimitedOperations.set(operationKey, Date.now());

            // Add the retry-after header to the request info for debugging
            const retryAfter = response.headers.get('retry-after');
            console.info('Retry after:', retryAfter || 'Not specified');
          }

          // Log auth errors for debugging
          if (!response.ok && isAuthRequest) {
            console.warn(`Auth request failed (${response.status}):`, requestInfo);
          }

          return response;
        })
        .catch(error => {
          console.error('Fetch error:', error, requestInfo);
          throw error;
        })
      );
  }

  // Default case for non-auth, non-GET requests
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
    // Reduce memory usage and prevent leaks for inactive tabs
    transport: {
      // Close websocket connection quicker when tab becomes inactive
      closeOnUninstantiate: true,
      // Automatically release resources when tab becomes inactive
      releaseDurations: {
        // Reduce the default 60 seconds to faster cleanup
        closing: 15 * 1000, // 15 seconds (default: 60)
        normalClosure: 15 * 1000, // 15 seconds (default: 60)
      },
    }
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

// Active tab management to limit realtime connections
// Only the active tab will maintain realtime subscriptions
window.addEventListener('visibilitychange', () => {
  isActiveTab = document.visibilityState === 'visible';

  // When tab becomes visible, reconnect realtime if previously disconnected
  if (isActiveTab) {
    // Replace deprecated session() call with async getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      supabase.realtime.setAuth(session?.access_token || null);
    });
  }
});

// Detect multi-tab scenario and synchronize which tab should handle realtime
window.addEventListener('storage', (event) => {
  if (event.key === 'activeRealtimeTab') {
    if (event.newValue && event.newValue !== tabId) {
      // Another tab has claimed ownership of realtime
      // Disconnect realtime in this tab if it's not the owner
      if (supabase.realtime.channels.length > 0) {
        supabase.realtime.disconnect();
      }
    }
  }
});

// Try to claim ownership when tab becomes active
if (document.visibilityState === 'visible') {
  localStorage.setItem('activeRealtimeTab', tabId);
}

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

// Helper to manage realtime channel subscriptions across tabs
export function useRealtimeChannel(channelName: string, options?: {
  enabled?: boolean;
}) {
  const { enabled = true } = options || {};

  useEffect(() => {
    // Only subscribe if this is the active tab and enabled
    if (!enabled || !isActiveTab) return;

    // Force only one tab to use realtime by claiming ownership
    localStorage.setItem('activeRealtimeTab', tabId);

    return () => {
      // When component unmounts, release ownership if this tab had it
      if (localStorage.getItem('activeRealtimeTab') === tabId) {
        localStorage.removeItem('activeRealtimeTab');
      }
    };
  }, [enabled, channelName]);

  return isActiveTab;
}