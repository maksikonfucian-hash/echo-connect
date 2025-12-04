import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramAuthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Изначально не загружаем — ждём события от виджета
    setLoading(false);

    const handler = async (event: any) => {
      const tgUser = event?.detail as TelegramAuthData | undefined;
      if (!tgUser) {
        console.warn('No telegram user data in event');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Telegram auth data received:', tgUser);

        // Попытаемся вызвать Supabase function (если настроена)
        if (supabase?.functions && typeof (supabase as any).functions.invoke === 'function') {
          try {
            console.log('Calling telegram-auth function...');
            const res = await (supabase as any).functions.invoke('telegram-auth', {
              body: JSON.stringify({ telegramUser: tgUser }),
            });

            console.log('Function response:', res);

            if (res && (res as any).data) {
              setUser((res as any).data);
              console.log('User set from function response:', (res as any).data);
            } else {
              setUser(tgUser);
            }
          } catch (fnErr) {
            console.warn('telegram-auth function invoke error:', fnErr);
            setUser(tgUser);
          }
        } else {
          console.log('Supabase functions not available, using Telegram data directly');
          setUser(tgUser);
        }
      } catch (err) {
        console.error('useTelegramAuth handler error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('telegram-auth', handler as EventListener);
    return () => window.removeEventListener('telegram-auth', handler as EventListener);
  }, []);

  const logout = async () => {
    setUser(null);
    setError(null);
    try {
      if (supabase?.auth && typeof supabase.auth.signOut === 'function') {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  return { user, loading, error, logout };
}

export default useTelegramAuth;