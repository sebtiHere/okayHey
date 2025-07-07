import React, { useState, useEffect } from 'react';
import { X, Shield, Ban } from 'lucide-react';
import { DiscordUser } from '../types/User';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [allUsers, setAllUsers] = useState<DiscordUser[]>([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllUsers(data.users);
      } catch (error) {
        // console.error('Failed to fetch all users for admin panel:', error);
      }
    };

    fetchAllUsers();
    // You might want to add socket listeners here for real-time updates on user status/bans/mutes
  }, []);

  const handleMute = async (userId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/mute/${userId}`, { method: 'POST', credentials: 'include' });
      alert(`User ${userId} mute status updated.`);
    } catch (error) {
      // console.error('Error muting user:', error);
      alert('Failed to update mute status.');
    }
  };

  const handleBan = async (userId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ban/${userId}`, { method: 'POST', credentials: 'include' });
      alert(`User ${userId} ban status updated.`);
    } catch (error) {
      // console.error('Error banning user:', error);
      alert('Failed to update ban status.');
    }
  };

  const handleIpBan = async (ipAddress: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/ip-ban/${ipAddress}`, { method: 'POST', credentials: 'include' });
      alert(`IP Address ${ipAddress} ban status updated.`);
    } catch (error) {
      // console.error('Error IP banning:', error);
      alert('Failed to update IP ban status.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2D2A2E] border border-[#5B595C] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-[#FCFCFA] hover:text-[#78DCE8]">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-mono font-semibold text-[#FCFCFA] mb-4">ADMIN_PANEL.exe</h2>

        <div className="space-y-4">
          {allUsers.length > 0 ? (
            allUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between bg-[#221F22] p-3 rounded-md border border-[#5B595C]">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://dummyimage.com/600x400/000/fff&text=${user.username ? user.username.charAt(0) : ''}`}
                    alt={user.username || ''}
                    className="w-8 h-8 rounded-full border border-[#5B595C]"
                  />
                  <span className="text-sm font-mono text-[#FCFCFA]">
                    {user.username} {user.isAdmin ? '(Admin)' : ''}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleMute(user.id)} className="p-1 rounded-full bg-[#DA7272] text-white hover:bg-[#C46767]">
                    <Shield className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleBan(user.id)} className="p-1 rounded-full bg-[#FF6188] text-white hover:bg-[#E8567A]">
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-mono text-[#FCFCFA] text-center">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};