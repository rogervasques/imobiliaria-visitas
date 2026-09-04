import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

export const RATE_LIMIT_MESSAGE = 'Muitas tentativas simultâneas. Por favor, aguarde alguns segundos e tente novamente.';

// Interceptor global do fetch para capturar erros HTTP 429 (Rate Limit / Too Many Requests)
const customFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.status === 429) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('supabase_rate_limit_429', {
          detail: {
            url: typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url,
            status: 429,
            message: RATE_LIMIT_MESSAGE,
          },
        })
      );
    }
  }
  return response;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  },
});

