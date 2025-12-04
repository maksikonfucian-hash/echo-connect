import { useEffect, useState } from 'react';
import AuthScreen from '@/components/screens/AuthScreen';
import ContactsScreen from '@/components/screens/ContactsScreen';
import CallScreen from '@/components/screens/CallScreen';
import { useTelegramAuth, TelegramAuthData } from '@/hooks/useTelegramAuth';
import { User } from '@/types/app';
import { mockContacts } from '@/data/mockContacts';

type Screen = 'auth' | 'contacts' | 'call';

const Index = () => {
  const { user, loading: authLoading, error: authError, logout } = useTelegramAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [activeCallContact, setActiveCallContact] = useState<User | null>(null);

  // Синхронизируем экран с состоянием авторизации
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setCurrentScreen('contacts');
      } else {
        setCurrentScreen('auth');
      }
    }
  }, [user, authLoading]);

  const handleLogin = async (authData: TelegramAuthData) => {
    console.log('Login successful:', authData);
    // Пользователь уже установлен в useTelegramAuth
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('auth');
  };

  const handleCall = (contact: User) => {
    setActiveCallContact(contact);
    setCurrentScreen('call');
  };

  const handleEndCall = () => {
    setActiveCallContact(null);
    setCurrentScreen('contacts');
  };

  // Показываем лоадер во время загрузки
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-telegram-blue border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку авторизации
  if (authError && currentScreen === 'auth') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Ошибка авторизации</p>
          <p className="text-sm text-muted-foreground mb-4">{authError}</p>
          <p className="text-xs text-muted-foreground">Обновите страницу и попробуйте снова.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'auth' && (
        <AuthScreen onLogin={handleLogin} isLoading={authLoading} />
      )}
      {currentScreen === 'contacts' && user && (
        <ContactsScreen
          currentUser={user}
          contacts={mockContacts}
          onCall={handleCall}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'call' && activeCallContact && (
        <CallScreen
          contact={activeCallContact}
          onEndCall={handleEndCall}
          onAcceptCall={() => setCurrentScreen('call')}
        />
      )}
    </>
  );
};

export default Index;