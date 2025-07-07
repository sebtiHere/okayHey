export interface DiscordUser {
  id: string;
  username: string | null | undefined;
  discriminator: string;
  avatar: string | null;
  last_active: number;
  isAdmin?: number; 
}

export interface User extends DiscordUser {
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
} 