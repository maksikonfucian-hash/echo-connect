import { ref, onMounted, readonly } from 'vue';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  referral_code?: string;
}

interface TelegramAuthResponse {
  data?: TelegramUser;
  error?: string;
  session_token?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      onAuth: (user: TelegramUser) => void;
    };
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser;
        };
      };
    };
  }
}

export function useTelegramAuth() {
  const user = ref<TelegramUser | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  onMounted(() => {
    const handler = async (event: Event) => {
      const tgUser = (event as CustomEvent<TelegramUser>)?.detail;
      if (!tgUser) {
        console.warn('No telegram user data in event');
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        console.log('Telegram auth data received:', tgUser);

        // Пытаемся вызвать Supabase function (если настроена)
        if (supabase?.functions?.invoke) {
          try {
            console.log('Calling telegram-auth function...');
            const res = await supabase.functions.invoke('telegram-auth', {
              body: JSON.stringify({ telegramUser: tgUser }),
            }) as TelegramAuthResponse;

            console.log('Function response:', res);

            if (res?.data) {
              user.value = res.data;
              if (res.session_token) {
                localStorage.setItem('session_token', res.session_token);
              }
              console.log('User set from function response:', res.data);
            } else if (res?.error) {
              console.warn('Function returned error:', res.error);
              // Даже если функция вернула ошибку — используем данные от Telegram
              user.value = tgUser;
            } else {
              user.value = tgUser;
            }
          } catch (fnErr) {
            console.warn('telegram-auth function invoke error:', fnErr);
            // Fallback — используем данные от Telegram
            user.value = tgUser;
          }
        } else {
          console.log('Supabase functions not available, using Telegram data directly');
          user.value = tgUser;
        }
      } catch (err) {
        console.error('useTelegramAuth handler error:', err);
        error.value = err instanceof Error ? err.message : 'Authentication failed';
        user.value = null;
      } finally {
        loading.value = false;
      }
    };

    window.addEventListener('telegram-auth', handler as EventListener);
    return () => window.removeEventListener('telegram-auth', handler as EventListener);
  });

  onMounted(() => {
    const checkWebApp = () => {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        console.log('User from Telegram WebApp:', tgUser);
        user.value = tgUser;
        loading.value = false;
      }
    };

    if (window.Telegram?.WebApp) {
      checkWebApp();
    } else {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.onload = () => {
        checkWebApp();
      };
      document.head.appendChild(script);
    }
  });

  const logout = async () => {
    user.value = null;
    error.value = null;
    localStorage.removeItem('session_token');
    try {
      if (supabase?.auth && typeof supabase.auth.signOut === 'function') {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  return { user: readonly(user), loading: readonly(loading), error: readonly(error), logout };
}

export default useTelegramAuth;