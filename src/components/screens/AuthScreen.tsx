import { TelegramLoginButton, TelegramAuthData } from '@/components/TelegramLoginButton';
import { Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (authData: TelegramAuthData) => void;
  isLoading?: boolean;
}

// ВАЖНО: Замените на имя вашего Telegram бота (без @)
const TELEGRAM_BOT_NAME = 'VoiceCallAuthBot';

export function AuthScreen({ onLogin, isLoading = false }: AuthScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full telegram-gradient flex items-center justify-center mb-8 shadow-call animate-scale-in">
          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 text-primary-foreground"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
          VoiceCall
        </h1>
        <p className="text-muted-foreground text-center mb-2 text-lg">
          Аудиозвонки через Telegram
        </p>
        <p className="text-muted-foreground/70 text-center text-sm max-w-xs">
          Быстрые и качественные голосовые вызовы с вашими контактами из Telegram
        </p>
      </div>

      {/* Features */}
      <div className="px-8 pb-8 animate-slide-up">
        <div className="bg-card rounded-2xl p-6 shadow-telegram mb-8">
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
              description="Звоните друзьям в один клик"
            />
          </div>
        </div>

        {/* Telegram Login Widget */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Авторизация...</span>
          </div>
        ) : (
          <TelegramLoginButton
            botName={TELEGRAM_BOT_NAME}
            onAuth={onLogin}
            buttonSize="large"
            usePic={true}
          />
        )}

        <p className="text-muted-foreground/60 text-xs text-center mt-4">
          Авторизуясь, вы соглашаетесь с условиями использования
        </p>
        
        <p className="text-muted-foreground/40 text-xs text-center mt-2">
          Для работы необходимо настроить Telegram бота
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
