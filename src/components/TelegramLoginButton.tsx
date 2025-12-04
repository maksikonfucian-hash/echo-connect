import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (user: TelegramAuthData) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  usePic?: boolean;
  requestAccess?: 'write';
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      onAuth: (user: TelegramAuthData) => void;
    };
  }
}

export function TelegramLoginButton({
  botName,
  onAuth,
  buttonSize = 'large',
  usePic = true,
  requestAccess = 'write',
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    // Set up callback
    window.TelegramLoginWidget = {
      onAuth: (user: TelegramAuthData) => {
        console.log('Telegram auth callback received:', user.id);
        onAuth(user);
      },
    };

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-onauth', 'TelegramLoginWidget.onAuth(user)');
    script.setAttribute('data-request-access', requestAccess);
    if (usePic) {
      script.setAttribute('data-userpic', 'true');
    }
    script.async = true;

    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup is tricky with Telegram widget, just leave it
    };
  }, [botName, buttonSize, usePic, requestAccess, onAuth]);

  return (
    <div className="w-full">
      {/* Telegram Widget Container */}
      <div 
        ref={containerRef} 
        className="flex justify-center min-h-[40px]"
      />
      
      {/* Fallback/Loading state shown while widget loads */}
      <noscript>
        <Button variant="telegram" size="xl" className="w-full" disabled>
          <Send className="mr-2" />
          Требуется JavaScript
        </Button>
      </noscript>
    </div>
  );
}

// Alternative: Manual button that opens Telegram OAuth
export function TelegramManualLoginButton({
  botName,
  redirectUrl,
  isLoading = false,
}: {
  botName: string;
  redirectUrl?: string;
  isLoading?: boolean;
}) {
  const handleClick = () => {
    const origin = redirectUrl || window.location.origin;
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${encodeURIComponent(origin)}&request_access=write`;
    window.location.href = authUrl;
  };

  return (
    <Button
      onClick={handleClick}
      variant="telegram"
      size="xl"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 animate-spin" />
      ) : (
        <Send className="mr-2" />
      )}
      Войти через Telegram
    </Button>
  );
}
