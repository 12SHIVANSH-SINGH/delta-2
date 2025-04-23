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
  
  // Early return if no signal times
  if (!signalTimes || Object.keys(signalTimes).length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Traffic Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-4">
            No signal data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Traffic Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(signalTimes).map(([direction, time]) => (
            <div key={direction} className="relative rounded-lg overflow-hidden">
              <div className="h-24 bg-gray-700 flex flex-col items-center justify-center p-4 relative">
                {/* Direction name */}
                <div className="text-lg font-medium text-white mb-2">{direction}</div>
                
                {/* Timing information */}
                <div className="text-sm text-gray-300">{time}s allocated</div>
                
                {/* Active indicator */}
                {activeSignal === direction && (
                  <>
                    <div className="absolute inset-0 bg-signal-green bg-opacity-20"></div>
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <div className="h-3 w-3 bg-signal-green rounded-full animate-pulse"></div>
                      <span className="text-signal-green text-xs font-medium">{countdown}s</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Traffic light visualization */}
              <div className="absolute top-0 left-0 bottom-0 w-2 flex flex-col space-y-1 p-1">
                <div className={`w-full aspect-square rounded-full ${
                  activeSignal !== direction ? 'bg-signal-red' : 'bg-gray-600'
                }`}></div>
                <div className={`w-full aspect-square rounded-full ${
                  activeSignal === direction && countdown <= 3 ? 'bg-signal-yellow' : 'bg-gray-600'
                }`}></div>
                <div className={`w-full aspect-square rounded-full ${
                  activeSignal === direction ? 'bg-signal-green' : 'bg-gray-600'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cycle information */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <div>Total Cycle: {getTotalCycleTime()}s</div>
          <div>Completed Cycles: {cycle}</div>
        </div>
      </CardContent>
    </Card>
  );
}