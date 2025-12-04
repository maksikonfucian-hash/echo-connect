import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { ContactsScreen } from '@/components/screens/ContactsScreen';
import { CallScreen } from '@/components/screens/CallScreen';
import { Screen, User } from '@/types/app';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useTelegramAuth, TelegramUser } from '@/hooks/useTelegramAuth';
import { TelegramAuthData } from '@/components/TelegramLoginButton';

const Index = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useTelegramAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [activeCallContact, setActiveCallContact] = useState<User | null>(null);

  // Sync screen with auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && currentScreen === 'auth') {
        setCurrentScreen('contacts');
      } else if (!isAuthenticated && currentScreen !== 'auth') {
        setCurrentScreen('auth');
      }
    }
  }, [isAuthenticated, isLoading, currentScreen]);

  const handleLogin = async (authData: TelegramAuthData) => {
    const result = await login(authData);
    if (result.success) {
      toast.success('Успешный вход!', {
        description: 'Добро пожаловать в VoiceCall',
      });
      setCurrentScreen('contacts');
    } else {
      toast.error('Ошибка входа', {
        description: result.error || 'Попробуйте ещё раз',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Вы вышли из аккаунта');
    setCurrentScreen('auth');
  };

  const handleCall = (contact: User) => {
    setActiveCallContact(contact);
    setCurrentScreen('call');
    toast('Начинаем звонок...', {
      description: `Вызов ${contact.name}`,
    });
  };

  const handleEndCall = () => {
    if (activeCallContact) {
      toast.info('Звонок завершён', {
        description: `с ${activeCallContact.name}`,
      });
    }
    setActiveCallContact(null);
    setCurrentScreen('contacts');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {currentScreen === 'auth' && (
        <AuthScreen onLogin={handleLogin} isLoading={isLoading} />
      )}

      {currentScreen === 'contacts' && (
        <ContactsScreen 
          onCall={handleCall} 
          onLogout={handleLogout}
          currentUser={user}
        />
      )}

      {currentScreen === 'call' && activeCallContact && (
        <CallScreen contact={activeCallContact} onEndCall={handleEndCall} />
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
