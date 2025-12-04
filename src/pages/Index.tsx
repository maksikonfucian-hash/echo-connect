import { useState } from 'react';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { ContactsScreen } from '@/components/screens/ContactsScreen';
import { CallScreen } from '@/components/screens/CallScreen';
import { Screen, User } from '@/types/app';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [activeCallContact, setActiveCallContact] = useState<User | null>(null);

  const handleLogin = () => {
    toast.success('Успешный вход!', {
      description: 'Добро пожаловать в VoiceCall',
    });
    setCurrentScreen('contacts');
  };

  const handleLogout = () => {
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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {currentScreen === 'auth' && (
        <AuthScreen onLogin={handleLogin} />
      )}

      {currentScreen === 'contacts' && (
        <ContactsScreen onCall={handleCall} onLogout={handleLogout} />
      )}

      {currentScreen === 'call' && activeCallContact && (
        <CallScreen contact={activeCallContact} onEndCall={handleEndCall} />
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default Index;
