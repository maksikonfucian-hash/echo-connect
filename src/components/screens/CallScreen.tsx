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

  useEffect(() => {
    if (!isIncoming && status === 'connecting') {
      const connectTimer = setTimeout(() => setStatus('ringing'), 1500);
      const activeTimer = setTimeout(() => setStatus('active'), 4000);
      return () => {
        clearTimeout(connectTimer);
        clearTimeout(activeTimer);
      };
    }
  }, [isIncoming, status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'active') {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000);
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
      case 'connecting': return 'Соединение...';
      case 'ringing': return isIncoming ? 'Входящий звонок' : 'Вызов...';
      case 'active': return formatDuration(duration);
      default: return '';
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
        <div className={cn('relative mb-8', status === 'ringing' && 'animate-call-pulse')}>
          {status === 'ringing' && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
            </>
          )}
          <Avatar user={contact} size="call" showStatus={false} className="relative z-10" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{contact.name}</h1>
        <p className={cn('text-lg transition-all duration-300', status === 'active' ? 'text-telegram-blue font-medium' : 'text-muted-foreground')}>
          {getStatusText()}
        </p>
      </div>

      {/* Controls */}
      <div className="px-8 pb-12 animate-slide-up">
        {!isIncoming || status === 'active' ? (
          <div className="flex items-center justify-center gap-6 mb-8">
            <Button onClick={() => setIsMuted(!isMuted)} variant={isMuted ? 'call-control-active' : 'call-control'} size="call">
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            <Button onClick={onEndCall} variant="call-end" size="call" className="shadow-lg">
              <PhoneOff className="w-6 h-6" />
            </Button>

            <Button onClick={() => setIsSpeakerOn(!isSpeakerOn)} variant={isSpeakerOn ? 'call-control-active' : 'call-control'} size="call">
              <Volume2 className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex flex-col items-center gap-2">
              <Button onClick={onEndCall} variant="call-end" size="call" className="shadow-lg">
                <PhoneOff className="w-6 h-6" />
              </Button>
              <span className="text-sm text-muted-foreground">Отклонить</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button onClick={handleAccept} variant="call-accept" size="call" className="shadow-lg animate-pulse-ring">
                <Phone className="w-6 h-6" />
              </Button>
              <span className="text-sm text-muted-foreground">Принять</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
