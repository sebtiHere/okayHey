import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock, Zap } from 'lucide-react';

export const WebsiteStatus: React.FC = () => {
  const [responseTime, setResponseTime] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setResponseTime(prev => {
        const variation = (Math.random() - 0.5) * 10;
        return Math.max(20, Math.min(100, prev + variation));
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#2D2A2E] border border-[#5B595C] rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#78DCE8]" />
          <h2 className="text-lg font-mono font-bold text-[#FCFCFA]">
            SYSTEM_STATUS
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-[#A9DC76]" />
          <span className="text-sm font-mono font-semibold text-[#A9DC76]">
            OPERATIONAL
          </span>
        </div>
      </div>

      {/* Essential Stats Only */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#221F22] border border-[#5B595C] rounded p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-[#A9DC76]" />
            <span className="text-xs font-mono text-[#A9DC76]">UPTIME</span>
          </div>
          <div className="text-lg font-mono font-bold text-[#FCFCFA]">
            99.9%
          </div>
        </div>

        <div className="bg-[#221F22] border border-[#5B595C] rounded p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-[#78DCE8]" />
            <span className="text-xs font-mono text-[#78DCE8]">PING</span>
          </div>
          <div className="text-lg font-mono font-bold text-[#FCFCFA]">
            {Math.round(responseTime)}ms
          </div>
        </div>
      </div>
    </div>
  );
};