import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramUser {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
}

interface AuthState {
  user: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SESSION_TOKEN_KEY = 'telegram_session_token';
const USER_DATA_KEY = 'telegram_user_data';

export function useTelegramAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);

      if (sessionToken && userData) {
        try {
          // Verify session is still valid in database
          const { data, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('session_token', sessionToken)
            .maybeSingle();

          if (data && !error) {
            setAuthState({
              user: {
                id: data.id,
                telegram_id: data.telegram_id,
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.username,
                photo_url: data.photo_url,
              },
              isLoading: false,
              isAuthenticated: true,
            });
            return;
          }
        } catch (error) {
          console.error('Session verification error:', error);
        }
        // Clear invalid session
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
      }

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    };

    checkSession();
  }, []);

  const login = useCallback(async (telegramAuthData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: telegramAuthData,
      });

      if (error) {
        console.error('Auth error:', error);
        throw new Error('Authentication failed');
      }

      if (data.success && data.user && data.session_token) {
        // Save session
        localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));

        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      }

      throw new Error(data.error || 'Authentication failed');
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const logout = useCallback(async () => {
    const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    
    if (sessionToken) {
      // Clear session in database
      try {
        await supabase
          .from('telegram_users')
          .update({ session_token: null })
          .eq('session_token', sessionToken);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
}
