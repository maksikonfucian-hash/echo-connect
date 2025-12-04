import { cn } from '@/lib/utils';
import { User } from '@/types/app';
import { StatusIndicator } from './StatusIndicator';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'call';
  showStatus?: boolean;
  className?: string;
}

export function Avatar({ user, size = 'md', showStatus = true, className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    call: 'w-32 h-32',
  };

  const statusSizes: Record<string, 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    call: 'lg',
  };

  const statusPositions = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: 'bottom-0 right-0',
    xl: 'bottom-0.5 right-0.5',
    call: 'bottom-2 right-2',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <img
        src={user.avatar}
        alt={user.name}
        className={cn(
          'rounded-full object-cover ring-2 ring-card',
          sizeClasses[size]
        )}
      />
      {showStatus && (
        <StatusIndicator
          status={user.status}
          size={statusSizes[size]}
          className={cn('absolute', statusPositions[size])}
        />
      )}
    </div>
  );
}
