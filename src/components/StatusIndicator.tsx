import { cn } from '@/lib/utils';
import { User } from '@/types/app';

interface StatusIndicatorProps {
  status: User['status'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({ status, size = 'md', className }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'rounded-full border-2 border-card',
        sizeClasses[size],
        status === 'online' && 'bg-online',
        status === 'recently' && 'bg-telegram-blue',
        status === 'offline' && 'bg-offline',
        className
      )}
    />
  );
}

export function formatLastSeen(date?: Date): string {
  if (!date) return 'давно';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return 'вчера';
  return `${days} дн. назад`;
}
