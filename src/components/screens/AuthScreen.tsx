import { TelegramLoginButton, TelegramAuthData } from '@/components/TelegramLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (authData: TelegramAuthData) => void;
  isLoading: boolean;
}

export function AuthScreen({ onLogin, isLoading }: AuthScreenProps) {
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

  const handleAuth = (user: TelegramAuthData) => {
    // Dispatch custom event for the hook
    const event = new CustomEvent('telegram-auth', { detail: user });
    window.dispatchEvent(event);
    // Also call onLogin for the parent
    onLogin(user);
  };

  if (!botUsername) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ошибка конфигурации</CardTitle>
            <CardDescription>
              Не указан username Telegram-бота в переменных окружения.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Echo Connect
          </CardTitle>
          <CardDescription>
            Войдите через Telegram для доступа к звонкам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <TelegramLoginButton
              botName={botUsername}
              onAuth={handleAuth}
              buttonSize="large"
              usePic={true}
            />
          )}
          <p className="text-sm text-gray-600 text-center">
            Авторизуйтесь, чтобы начать общение
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Примечание: Убедитесь, что в настройках Telegram-бота установлен домен веб-приложения через /setdomain в BotFather.
            Для локальной разработки используйте ngrok и установите HTTPS URL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthScreen;