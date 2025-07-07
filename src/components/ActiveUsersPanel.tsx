import React, { useState, useEffect } from 'react';
import { Users, Circle } from 'lucide-react';
import { DiscordUser } from '../types/User'; // Using DiscordUser as base type
import io from 'socket.io-client';

// Type Guard to ensure user is a valid DiscordUser
function isDiscordUser(user: any): user is DiscordUser {
  return user !== null && user !== undefined && typeof user.id === 'string' && typeof user.username === 'string';
}

interface ActiveUsersPanelProps {
  currentUser: DiscordUser | null;
}

export const ActiveUsersPanel: React.FC<ActiveUsersPanelProps> = ({ currentUser }) => {
  const [activeUsers, setActiveUsers] = useState<DiscordUser[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<DiscordUser[]>([]);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL}`, { withCredentials: true });

    socket.on('initial_user_data', ({ activeUsers, inactiveUsers }) => {
      setActiveUsers(activeUsers.filter(isDiscordUser));
      setInactiveUsers(inactiveUsers.filter(isDiscordUser));
    });

    socket.on('user_status_update', (updatedUser: DiscordUser) => {
      // Check if the updated user is active (within the last 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const isActive = updatedUser.last_active >= fiveMinutesAgo;

      setActiveUsers(prevActiveUsers => {
        const newActiveUsers = prevActiveUsers.filter((user: DiscordUser) => isDiscordUser(user) && user.id !== updatedUser.id);
        if (isActive) {
          return [...newActiveUsers, updatedUser];
        }
        return newActiveUsers;
      });

      setInactiveUsers(prevInactiveUsers => {
        const newInactiveUsers = prevInactiveUsers.filter((user: DiscordUser) => isDiscordUser(user) && user.id !== updatedUser.id);
        if (!isActive) {
          return [...newInactiveUsers, updatedUser];
        }
        return newInactiveUsers;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const formatLastSeen = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-[#2D2A2E] border border-[#5B595C] rounded-lg p-4 sticky top-24">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-4 h-4 text-[#78DCE8]" />
        <h3 className="text-sm font-mono font-semibold text-[#FCFCFA]">
          ACTIVE_USERS ({activeUsers.length + inactiveUsers.length})
        </h3>
      </div>

      <div className="space-y-4">
        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-[#A9DC76] mb-2 flex items-center">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              ACTIVE ({activeUsers.length})
            </h4>
            <div className="space-y-2">
              {activeUsers.map((user: DiscordUser) => {
                return (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <img
                        src={user && user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://dummyimage.com/600x400/000/fff&text=${(user?.username ?? '').charAt(0)}`}
                        alt={user?.username || ''}
                      className="w-6 h-6 rounded-full border border-[#5B595C]"
                    />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#2D2A2E] bg-[#A9DC76]" />
                  </div>
                  <span className="text-xs font-mono text-[#FCFCFA] truncate flex-1">
                    {user.username}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactive Users */}
        {inactiveUsers.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-[#727072] mb-2 flex items-center">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              INACTIVE ({inactiveUsers.length})
            </h4>
            <div className="space-y-2">
              {inactiveUsers.map((user: DiscordUser) => {
                return (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <img
                          src={user && user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://dummyimage.com/600x400/000/fff&text=${(user?.username ?? '').charAt(0)}`}
                          alt={user?.username || ''}
                        className="w-6 h-6 rounded-full border border-[#5B595C] opacity-50"
                      />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#2D2A2E] bg-[#727072]" />
                    </div>
                    <span className="text-xs font-mono text-[#727072] truncate">
                      {user.username}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#727072]">
                      {formatLastSeen(user.last_active)}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};