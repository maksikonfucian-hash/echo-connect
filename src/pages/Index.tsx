import { useEffect, useState } from 'react';
import AuthScreen from '@/components/screens/AuthScreen';
import { ContactsScreen } from '@/components/screens/ContactsScreen'; // <-- Именованный импорт
import CallScreen from '@/components/screens/CallScreen';
import { useTelegramAuth, TelegramAuthData } from '@/hooks/useTelegramAuth';
import { User } from '@/types/app';
import { mockContacts } from '@/data/mockContacts';

type Screen = 'auth' | 'contacts' | 'call';

const Index = () => {
  const { user, loading: authLoading, error: authError, logout } = useTelegramAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [activeCallContact, setActiveCallContact] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentScreen('contacts');
    } else {
      setCurrentScreen('auth');
    }
  }, [user]);

  const handleLogin = async (authData: TelegramAuthData) => {
    console.log('Login successful:', authData);
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
          currentUser={user as User}
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
