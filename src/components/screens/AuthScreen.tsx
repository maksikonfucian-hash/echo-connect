import { TelegramAuthData, TelegramLoginButton } from '@/components/TelegramLoginButton';

interface AuthScreenProps {
  onLogin: (authData: TelegramAuthData) => void;
  isLoading?: boolean;
}

export function AuthScreen({ onLogin, isLoading = false }: AuthScreenProps) {
  // Получаем botName из переменных окружения (работает и на локале, и на Vercel)
  const botName = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string) || '';

  if (!botName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Ошибка конфигурации</p>
          <p className="text-sm text-muted-foreground">VITE_TELEGRAM_BOT_USERNAME не установлена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-telegram-blue flex items-center justify-center shadow-lg mb-6">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-5.39 5.39c-.78.78-2.05.78-2.83 0l-2.83-2.83c-.78-.78-.78-2.05 0-2.83s2.05-.78 2.83 0L8 9.34l4.34-4.34c.78-.78 2.05-.78 2.83 0s.78 2.05 0 2.83z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">VoiceCall</h1>
        <p className="text-muted-foreground mb-12">Аудиозвонки через Telegram</p>

        {/* Features */}
        <div className="w-full max-w-sm bg-card p-6 rounded-xl shadow-lg mb-8">
          <div className="space-y-4">
            <Feature
              icon="🎧"
              title="Кристальный звук"
              description="Высокое качество аудио через WebRTC"
            />
            <Feature
              icon="🔒"
              title="Безопасность"
              description="Шифрование звонков end-to-end"
            />
            <Feature
              icon="⚡"
              title="Мгновенное соединение"
              description="Зовите друзей в один клик"
            />
          </div>
        </div>

        {/* Login Button */}
        <div className="flex justify-center">
          <TelegramLoginButton
            botName={botName}
            onAuth={onLogin}
            buttonSize="large"
            usePic={false}
          />
        </div>

        {isLoading && <div className="mt-4 text-sm text-muted-foreground">Обработка авторизации…</div>}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground">
        <p>Авторизуйтесь, согласившись с условиями использования</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}