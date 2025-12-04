import { User } from '@/types/app';

export const mockContacts: User[] = [
  {
    id: '1',
    name: 'Александр Петров',
    username: '@alex_p',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'online',
  },
  {
    id: '2',
    name: 'Мария Иванова',
    username: '@maria_iv',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    status: 'online',
  },
  {
    id: '3',
    name: 'Дмитрий Сидоров',
    username: '@dmitry_s',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    status: 'recently',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 минут назад
  },
  {
    id: '4',
    name: 'Елена Козлова',
    username: '@elena_k',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'online',
  },
  {
    id: '5',
    name: 'Сергей Николаев',
    username: '@sergey_n',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
  },
  {
    id: '6',
    name: 'Анна Смирнова',
    username: '@anna_sm',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'online',
  },
  {
    id: '7',
    name: 'Павел Морозов',
    username: '@pavel_m',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), // вчера
  },
];
