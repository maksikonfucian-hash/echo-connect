import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { User, CallStatus } from '@/types/app';
import { Mic, MicOff, Volume2, PhoneOff, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallScreenProps {
  contact: User;
  isIncoming?: boolean;
  onEndCall: () => void;
  onAcceptCall?: () => void;
}

export function CallScreen({ contact, isIncoming = false, onEndCall, onAcceptCall }: CallScreenProps) {
  const [status, setStatus] = useState<CallStatus>(isIncoming ? 'ringing' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [duration, setDuration] = useState(0);

  // Simulate call connection
  useEffect(() => {
    if (!isIncoming && status === 'connecting') {
      const connectTimer = setTimeout(() => {
        setStatus('ringing');
      }, 1500);

      const activeTimer = setTimeout(() => {
        setStatus('active');
      }, 4000);

      return () => {
        clearTimeout(connectTimer);
        clearTimeout(activeTimer);
      };
    }
  }, [isIncoming, status]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Соединение...';
      case 'ringing':
        return isIncoming ? 'Входящий звонок' : 'Вызов...';
      case 'active':
        return formatDuration(duration);
      default:
        return '';
    }
  };

  const handleAccept = () => {
    setStatus('active');
    onAcceptCall?.();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Top Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 animate-fade-in">
        {/* Avatar with pulse animation */}
        <div className={cn(
          'relative mb-8',
          status === 'ringing' && 'animate-call-pulse'
        )}>
          {status === 'ringing' && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
            </>
          )}
          <Avatar user={contact} size="call" showStatus={false} className="relative z-10" />
        </div>

        {/* Contact Info */}
        <h1 className="text-2xl font-bold text-foreground mb-2">{contact.name}</h1>
        <p className={cn(
          'text-lg transition-all duration-300',
          status === 'active' ? 'text-telegram-blue font-medium' : 'text-muted-foreground'
        )}>
          {getStatusText()}
        </p>

        {/* Visual feedback dots for connecting/ringing */}
        {(status === 'connecting' || status === 'ringing') && (
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {/* Encryption badge */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full">
          <svg className="w-4 h-4 text-telegram-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          <span className="text-sm text-muted-foreground">Шифрование включено</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 pb-12 animate-slide-up">
        {/* Main Controls */}
        {!isIncoming || status === 'active' ? (
          <div className="flex items-center justify-center gap-6 mb-8">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant={isMuted ? 'call-control-active' : 'call-control'}
              size="call"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            <Button
              onClick={onEndCall}
              variant="call-end"
              size="call"
              className="shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            <Button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              variant={isSpeakerOn ? 'call-control-active' : 'call-control'}
              size="call"
            >
              <Volume2 className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          /* Incoming Call Controls */
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={onEndCall}
                variant="call-end"
                size="call"
                className="shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <span className="text-sm text-muted-foreground">Отклонить</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={handleAccept}
                variant="call-accept"
                size="call"
                className="shadow-lg animate-pulse-ring"
              >
                <Phone className="w-6 h-6" />
              </Button>
              <span className="text-sm text-muted-foreground">Принять</span>
            </div>
          </div>
        )}

        {/* Labels for controls */}
        {(!isIncoming || status === 'active') && (
          <div className="flex items-center justify-center gap-6">
            <span className="w-16 text-center text-xs text-muted-foreground">
              {isMuted ? 'Вкл. микро' : 'Откл. микро'}
            </span>
            <span className="w-16 text-center text-xs text-muted-foreground">
              Завершить
            </span>
            <span className="w-16 text-center text-xs text-muted-foreground">
              {isSpeakerOn ? 'Выкл. динамик' : 'Вкл. динамик'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
