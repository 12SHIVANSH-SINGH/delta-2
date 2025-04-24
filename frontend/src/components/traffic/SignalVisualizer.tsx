'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface SignalVisualizerProps {
  signalTimes: Record<string, number>;
  className?: string;
}

export default function SignalVisualizer({ signalTimes, className = '' }: SignalVisualizerProps) {
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [cycle, setCycle] = useState<number>(0);

  // Total time of a full cycle
  const getTotalCycleTime = () => {
    return Object.values(signalTimes).reduce((sum, time) => sum + time, 0);
  };
  
  // Run a simulated signal cycle
  useEffect(() => {
    if (!signalTimes || Object.keys(signalTimes).length === 0) {
      setActiveSignal(null);
      setCountdown(0);
      return;
    }
    
    // Get directions in order
    const directions = Object.keys(signalTimes);
    
    // Start with the first direction
    if (!activeSignal) {
      setActiveSignal(directions[0]);
      setCountdown(signalTimes[directions[0]]);
    }
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next direction when countdown reaches 0
          const currentIndex = directions.indexOf(activeSignal!);
          const nextIndex = (currentIndex + 1) % directions.length;
          const nextDirection = directions[nextIndex];
          
          setActiveSignal(nextDirection);
          
          // Increment cycle counter when we loop back to the first direction
          if (nextIndex === 0) {
            setCycle(prevCycle => prevCycle + 1);
          }
          
          return signalTimes[nextDirection];
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [signalTimes, activeSignal]);
  
  // Get background color based on active state
  const getBackgroundColor = (direction: string) => {
    if (activeSignal === direction) {
      if (countdown <= 3) return 'bg-yellow-100';
      return 'bg-green-100';
    }
    return 'bg-red-100';
  };
  
  // Get text color based on active state
  const getTextColor = (direction: string) => {
    if (activeSignal === direction) {
      if (countdown <= 3) return 'text-gray-900';
      return 'text-gray-900';
    }
    return 'text-gray-900';
  };
  
  // Early return if no signal times
  if (!signalTimes || Object.keys(signalTimes).length === 0) {
    return (
      <Card className={`${className} bg-white border border-gray-300`}>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Traffic Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No signal data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-white border border-gray-300`}>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-gray-900">Traffic Signals</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(signalTimes).map(([direction, time]) => (
            <div key={direction} className={`relative rounded border border-gray-300 overflow-hidden shadow-sm ${getBackgroundColor(direction)} transition-colors duration-300`}>
              <div className="h-32 flex flex-col items-center justify-center p-4 relative">
                {/* Direction name */}
                <div className={`text-lg font-medium mb-2 z-10 ${getTextColor(direction)}`}>{direction}</div>
                
                {/* Timing information */}
                <div className={`text-sm z-10 ${getTextColor(direction)}`}>{time}s allocated</div>
                
                {/* Active indicator */}
                {activeSignal === direction && (
                  <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
                    <div className="h-3 w-3 bg-black rounded-full animate-pulse"></div>
                    <span className="text-gray-900 text-xs font-medium">{countdown}s</span>
                  </div>
                )}
              </div>
              
              {/* Traffic light visualization */}
              <div className="absolute top-0 left-0 bottom-0 w-8 bg-black flex flex-col justify-center items-center space-y-2 py-2 z-20">
                <div className={`w-6 aspect-square rounded-full ${
                  activeSignal !== direction ? 'bg-red-600' : 'bg-gray-700'
                }`}></div>
                <div className={`w-6 aspect-square rounded-full ${
                  activeSignal === direction && countdown <= 3 ? 'bg-yellow-400' : 'bg-gray-700'
                }`}></div>
                <div className={`w-6 aspect-square rounded-full ${
                  activeSignal === direction ? 'bg-green-500' : 'bg-gray-700'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cycle information */}
        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <div className="flex justify-center space-x-6">
            <div className="text-sm text-gray-700">Total Cycle: <span className="font-medium">{getTotalCycleTime()}s</span></div>
            <div className="text-sm text-gray-700">Completed Cycles: <span className="font-medium">{cycle}</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}