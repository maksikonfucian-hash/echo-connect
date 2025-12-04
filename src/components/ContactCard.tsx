import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/Avatar';
import { formatLastSeen } from '@/components/StatusIndicator';
import { User } from '@/types/app';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: User;
  onCall: (contact: User) => void;
}

export function ContactCard({ contact, onCall }: ContactCardProps) {
  const isOnline = contact.status === 'online';

  const getStatusText = () => {
    if (contact.status === 'online') return 'онлайн';
    if (contact.status === 'recently') return 'был(а) недавно';
    return `был(а) ${formatLastSeen(contact.lastSeen)}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-telegram transition-all duration-200 hover:shadow-telegram-lg active:scale-[0.99]">
      <Avatar user={contact} size="md" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{contact.name}</h3>
        <p className={cn(
          'text-sm truncate',
          isOnline ? 'text-telegram-blue' : 'text-muted-foreground'
        )}>
          {getStatusText()}
        </p>
      </div>

      <Button
        onClick={() => onCall(contact)}
        variant={isOnline ? 'telegram' : 'secondary'}
        size="icon-lg"
        disabled={!isOnline}
        className="shrink-0"
      >
        <Phone className="w-5 h-5" />
      </Button>
    </div>
  );
}
