'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { TrafficResponse } from '@/types';
import { formatTime, determineActiveSignal } from '@/lib/utils';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function SignalsPage() {
  const [trafficData, setTrafficData] = useState<TrafficResponse | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [cycle, setCycle] = useState<number>(0);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  
  // Subscribe to real-time traffic data
  useEffect(() => {
    const subscription = api.subscribeToTrafficFeed(
      (data) => {
        setTrafficData(data);
        setConnected(true);
        setActiveSignal(determineActiveSignal(data.signal_times));
      },
      (error) => {
        console.error('Error subscribing to traffic feed:', error);
        setConnected(false);
      }
    );
    
    // Cleanup on component unmount
    return () => {
      subscription.close();
    };
  }, []);
  
  // Simulate time passing for the signal cycle
  useEffect(() => {
    if (!trafficData?.signal_times || !activeSignal) return;
    
    const totalCycleTime = Object.values(trafficData.signal_times).reduce((a, b) => a + b, 0);
    let elapsed = 0;
    
    // Find elapsed time up to the active signal
    const directions = Object.keys(trafficData.signal_times);
    const activeIndex = directions.indexOf(activeSignal);
    
    for (let i = 0; i < activeIndex; i++) {
      elapsed += trafficData.signal_times[directions[i]];
    }
    
    // Set the simulation time
    setSimulationTime(elapsed);
    
    const timer = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = prev + 1;
        if (newTime >= totalCycleTime) {
          setCycle(c => c + 1);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [trafficData, activeSignal]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Traffic Signals</h1>
        
        <div className="flex items-center text-sm space-x-4">
          <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Signal Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Signal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-96">
              {/* Intersection visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Road structure */}
                <div className="relative w-full h-full max-w-md max-h-md">
                  {/* Horizontal road */}
                  <div className="absolute top-1/2 left-0 right-0 h-24 transform -translate-y-1/2 bg-gray-700"></div>
                  
                  {/* Vertical road */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-24 transform -translate-x-1/2 bg-gray-700"></div>
                  
                  {/* Center of intersection */}
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 bg-gray-600"></div>
                  
                  {/* Road markings */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 flex">
                    <div className="flex-1 h-full">
                      <div className="w-8 h-full bg-white mx-auto"></div>
                    </div>
                    <div className="w-24"></div>
                    <div className="flex-1 h-full">
                      <div className="w-8 h-full bg-white mx-auto"></div>
                    </div>
                  </div>
                  
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 flex flex-col">
                    <div className="flex-1 w-full">
                      <div className="h-8 w-full bg-white mx-auto"></div>
                    </div>
                    <div className="h-24"></div>
                    <div className="flex-1 w-full">
                      <div className="h-8 w-full bg-white mx-auto"></div>
                    </div>
                  </div>
                  
                  {/* Traffic lights */}
                  <div className="absolute top-1/4 right-1/4 transform translate-x-12 -translate-y-12 bg-gray-800 p-2 rounded-md">
                    <div className={`w-6 h-6 rounded-full mb-1 ${activeSignal === 'North' ? 'bg-signal-green' : 'bg-signal-red'}`}></div>
                    <div className={`text-xs text-center ${activeSignal === 'North' ? 'text-signal-green' : 'text-signal-red'} font-medium`}>North</div>
                  </div>
                  
                  <div className="absolute bottom-1/4 left-1/4 transform -translate-x-12 translate-y-12 bg-gray-800 p-2 rounded-md">
                    <div className={`w-6 h-6 rounded-full mb-1 ${activeSignal === 'South' ? 'bg-signal-green' : 'bg-signal-red'}`}></div>
                    <div className={`text-xs text-center ${activeSignal === 'South' ? 'text-signal-green' : 'text-signal-red'} font-medium`}>South</div>
                  </div>
                  
                  <div className="absolute bottom-1/4 right-1/4 transform translate-x-12 translate-y-12 bg-gray-800 p-2 rounded-md">
                    <div className={`w-6 h-6 rounded-full mb-1 ${activeSignal === 'East' ? 'bg-signal-green' : 'bg-signal-red'}`}></div>
                    <div className={`text-xs text-center ${activeSignal === 'East' ? 'text-signal-green' : 'text-signal-red'} font-medium`}>East</div>
                  </div>
                  
                  <div className="absolute top-1/4 left-1/4 transform -translate-x-12 -translate-y-12 bg-gray-800 p-2 rounded-md">
                    <div className={`w-6 h-6 rounded-full mb-1 ${activeSignal === 'West' ? 'bg-signal-green' : 'bg-signal-red'}`}></div>
                    <div className={`text-xs text-center ${activeSignal === 'West' ? 'text-signal-green' : 'text-signal-red'} font-medium`}>West</div>
                  </div>
                  
                  {/* Signal timing indicator */}
                  {activeSignal && trafficData && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 px-3 py-2 rounded-full text-white text-sm font-medium flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{activeSignal}: {trafficData.signal_times[activeSignal]}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Signal Timing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Cycle information */}
              <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Current Cycle</div>
                  <div className="text-xl font-bold text-white">{cycle}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Elapsed Time</div>
                  <div className="text-xl font-bold text-white">{formatTime(simulationTime)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Total Cycle Time</div>
                  <div className="text-xl font-bold text-white">
                    {formatTime(
                      trafficData 
                        ? Object.values(trafficData.signal_times).reduce((a, b) => a + b, 0)
                        : 0
                    )}
                  </div>
                </div>
              </div>
              
              {/* Signal timings */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Current Signal Timings</div>
                
                {trafficData ? (
                  Object.entries(trafficData.signal_times).map(([direction, time]) => (
                    <div key={direction} className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            activeSignal === direction ? 'bg-signal-green' : 'bg-signal-red'
                          }`}></div>
                          <span className="font-medium">{direction}</span>
                        </div>
                        <div className="text-sm">
                          {time} seconds
                          {activeSignal === direction && (
                            <span className="ml-2 text-xs text-signal-green">(Active)</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            activeSignal === direction ? 'bg-signal-green' : 'bg-gray-600'
                          }`}
                          style={{ 
                            width: activeSignal === direction 
                              ? `${Math.min(100, (simulationTime % time) / time * 100)}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">No signal data available</div>
                )}
              </div>
              
              {/* Emergency override */}
              <div>
                <div className="text-sm font-medium mb-2">Emergency Override</div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Manually override signal timing</div>
                    <div>
                      <Button
                        variant="danger"
                        size="sm"
                      >
                        Emergency Override
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Signal Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Signal Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    North
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    South
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    East
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    West
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    Morning Rush (6-9 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">40s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">35s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="bg-success-500 bg-opacity-20 text-success-400 px-2 py-1 rounded-full text-xs">
                      Active
                    </span>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    Midday (9 AM-4 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="bg-gray-600 px-2 py-1 rounded-full text-xs">
                      Scheduled
                    </span>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    Evening Rush (4-7 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">40s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="bg-gray-600 px-2 py-1 rounded-full text-xs">
                      Scheduled
                    </span>
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    Night (7 PM-6 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">20s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">20s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">20s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">20s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="bg-gray-600 px-2 py-1 rounded-full text-xs">
                      Scheduled
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}