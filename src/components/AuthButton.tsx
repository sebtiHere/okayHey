import React from 'react';
import { LogIn, LogOut } from 'lucide-react';

interface AuthButtonProps {
  user: any; // Consider replacing 'any' with a proper user type
  onLogout: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ user, onLogout }) => {
  const handleSignIn = () => {
    // Initiates Discord OAuth
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/discord`;
  };

  return (
    <div>
      {user ? (
        <button
          onClick={onLogout}
          className="inline-flex items-center px-4 py-2 border border-[#5B595C] text-sm font-medium font-mono text-[#FCFCFA] bg-[#DA7272] hover:bg-[#C46767] hover:border-[#DA7272] transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          LOGOUT ({user.username})
        </button>
      ) : (
    <button
      onClick={handleSignIn}
      className="inline-flex items-center px-4 py-2 border border-[#5B595C] text-sm font-medium font-mono text-[#FCFCFA] bg-[#7289DA] hover:bg-[#677BC4] hover:border-[#7289DA] transition-all duration-200"
    >
      <LogIn className="w-4 h-4 mr-2" />
      LOGIN_WITH_DISCORD
    </button>
      )}
    </div>
  );
};
