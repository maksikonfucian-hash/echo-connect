export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'recently';
  lastSeen?: Date;
}

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended';

export interface CallState {
  status: CallStatus;
  contact: User | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
}

export type Screen = 'auth' | 'contacts' | 'call';
