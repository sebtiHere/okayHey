import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  Users
} from 'lucide-react';

export const StatusPanel: React.FC = () => {
  const [responseTime, setResponseTime] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setResponseTime(prev => {
        const variation = (Math.random() - 0.5) * 5;
        return Math.max(35, Math.min(55, prev + variation));
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#2D2A2E] border border-[#5B595C] rounded-lg p-3 sticky top-24">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-4 h-4 text-[#A9DC76]" />
        <h3 className="text-sm font-mono font-semibold text-[#FCFCFA]">
          STATUS
        </h3>
      </div>
      
      {/* Essential Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#727072]">UPTIME</span>
          <span className="text-[#A9DC76]">99.9%</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#727072]">PING</span>
          <span className="text-[#78DCE8]">{Math.round(responseTime)}ms</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#727072]">ONLINE</span>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-[#AB9DF2]" />
            <span className="text-[#AB9DF2]">8</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#727072]">STATUS</span>
          <CheckCircle className="w-3 h-3 text-[#A9DC76]" />
        </div>
      </div>
    </div>
  );
};