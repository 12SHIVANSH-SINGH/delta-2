'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { TrafficResponse } from '@/types';
import { formatTime, determineActiveSignal } from '@/lib/utils';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SignalsPage() {
  const [trafficData, setTrafficData] = useState<TrafficResponse | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [cycle, setCycle] = useState<number>(0);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Professional color theme
  const colors = {
    red: '#E53935',
    green: '#43A047',
    yellow: '#FDD835',
    primary: '#2563EB',
    secondary: '#475569',
    accent: '#0369A1',
    emergency: '#DC2626',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      light: '#94A3B8'
    }
  };

  const directionColors = {
    North: '#2563EB', // Blue
    South: '#8B5CF6', // Purple
    East: '#DB8B02',  // Orange
    West: '#0D9488',  // Teal
  };

  // Subscribe to real-time traffic data
  useEffect(() => {
    const subscription = api.subscribeToTrafficFeed(
      (data) => {
        setTrafficData(data);
        setConnected(true);
        setActiveSignal(determineActiveSignal(data.signal_times));

        // Check for emergency vehicles
        const hasEmergency = Object.values(data.lanes).some(lane => lane.emergency);
        if (hasEmergency && !isEmergencyMode) {
          toast.error('Emergency vehicle detected', {
            duration: 5000,
            style: {
              background: colors.emergency,
              color: 'white',
              fontWeight: 'bold',
            },
          });
        }
      },
      (error) => {
        console.error('Error subscribing to traffic feed:', error);
        setConnected(false);
      }
    );

    return () => {
      subscription.close();
    };
  }, [isEmergencyMode]);

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

  // Handle emergency override
  const handleEmergencyOverride = () => {
    setIsEmergencyMode(!isEmergencyMode);
    toast.success(isEmergencyMode ? 'Emergency mode deactivated' : 'Emergency mode activated', {
      style: {
        background: isEmergencyMode ? colors.green : colors.emergency,
        color: 'white',
      },
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Refreshing traffic data...', {
      style: {
        background: colors.primary,
        color: 'white',
      },
    });
  };

  // Get current time period
  const getCurrentTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'Morning Rush (6-9 AM)';
    if (hour >= 9 && hour < 16) return 'Midday (9 AM-4 PM)';
    if (hour >= 16 && hour < 19) return 'Evening Rush (4-7 PM)';
    return 'Night (7 PM-6 AM)';
  };

  return (
    <div className="space-y-6 pb-8 bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Traffic Signals Dashboard
        </h1>

        <div className="flex items-center text-sm space-x-4">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${connected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
            <span className="font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-primary-600 hover:bg-primary-700 text-white border-none"
            onClick={handleRefresh}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Signal Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 bg-white shadow-md">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <CardTitle className="text-lg text-gray-700">Current Signal Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative h-96">
              {/* Intersection visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Road structure */}
                <div className="relative w-full h-full max-w-md max-h-md">
                  {/* Horizontal road */}
                  <div className="absolute top-1/2 left-0 right-0 h-24 transform -translate-y-1/2 bg-gray-200 shadow"></div>

                  {/* Vertical road */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-24 transform -translate-x-1/2 bg-gray-200 shadow"></div>

                  {/* Center of intersection */}
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 bg-gray-300"></div>

                  {/* Road markings */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 transform -translate-y-1/2 flex">
                    <div className="flex-1 h-full">
                      <div className="w-8 h-full bg-yellow-400 mx-auto"></div>
                    </div>
                    <div className="w-24"></div>
                    <div className="flex-1 h-full">
                      <div className="w-8 h-full bg-yellow-400 mx-auto"></div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 flex flex-col">
                    <div className="flex-1 w-full">
                      <div className="h-8 w-full bg-yellow-400 mx-auto"></div>
                    </div>
                    <div className="h-24"></div>
                    <div className="flex-1 w-full">
                      <div className="h-8 w-full bg-yellow-400 mx-auto"></div>
                    </div>
                  </div>

                  {/* Traffic lights */}
                  {['North', 'South', 'East', 'West'].map((direction) => {
                    const isActive = activeSignal === direction;
                    const hasEmergency = trafficData?.lanes[direction]?.emergency;
                    const dirColor = directionColors[direction as keyof typeof directionColors];

                    let position = '';
                    switch (direction) {
                      case 'North':
                        position = 'top-1/4 right-1/4 transform translate-x-12 -translate-y-12';
                        break;
                      case 'South':
                        position = 'bottom-1/4 left-1/4 transform -translate-x-12 translate-y-12';
                        break;
                      case 'East':
                        position = 'bottom-1/4 right-1/4 transform translate-x-12 translate-y-12';
                        break;
                      case 'West':
                        position = 'top-1/4 left-1/4 transform -translate-x-12 -translate-y-12';
                        break;
                    }

                    return (
                      <div
                        key={direction}
                        className={`absolute ${position} bg-white p-2 rounded shadow-md border`}
                        style={{ borderColor: dirColor }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full mb-1 ${hasEmergency ? 'animate-pulse' : ''}`}
                          style={{
                            backgroundColor: hasEmergency ? colors.red : isActive ? colors.green : colors.red
                          }}
                        ></div>
                        <div
                          className="text-xs text-center font-medium"
                          style={{
                            color: dirColor
                          }}
                        >
                          {direction}
                        </div>
                      </div>
                    );
                  })}

                  {/* Signal timing indicator */}
                  {activeSignal && trafficData && (
                    <div
                      className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded text-white text-sm font-medium flex items-center shadow"
                      style={{
                        backgroundColor: directionColors[activeSignal as keyof typeof directionColors]
                      }}
                    >
                      <ClockIcon className="h-4 w-4 mr-1.5" />
                      <span>{activeSignal}: {trafficData.signal_times[activeSignal]}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-md">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <CardTitle className="text-lg text-gray-700">Signal Timing Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Cycle information */}
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-200">
                <div>
                  <div className="text-sm text-gray-500">Current Cycle</div>
                  <div className="text-xl font-bold text-gray-800">{cycle}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Elapsed Time</div>
                  <div className="text-xl font-bold text-gray-800">{formatTime(simulationTime)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Total Cycle Time</div>
                  <div className="text-xl font-bold text-gray-800">
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
                <div className="text-sm font-medium text-gray-700">Current Signal Timings</div>

                {trafficData ? (
                  Object.entries(trafficData.signal_times).map(([direction, time]) => {
                    const isActive = activeSignal === direction;
                    const hasEmergency = trafficData.lanes[direction]?.emergency;
                    const dirColor = directionColors[direction as keyof typeof directionColors];

                    return (
                      <div
                        key={direction}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                        style={{
                          borderLeftColor: dirColor,
                          borderLeftWidth: '4px'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${hasEmergency ? 'animate-pulse' : ''}`}
                              style={{
                                backgroundColor: hasEmergency ? colors.red : isActive ? colors.green : colors.red
                              }}
                            ></div>
                            <span
                              className="font-medium"
                              style={{ color: dirColor }}
                            >
                              {direction}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {time} seconds
                            {isActive && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                            )}
                            {hasEmergency && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">Emergency</span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${hasEmergency ? 'animate-pulse' : ''}`}
                            style={{
                              width: isActive ? `${Math.min(100, (simulationTime % time) / time * 100)}%` : '0%',
                              backgroundColor: hasEmergency ? colors.red : isActive ? dirColor : 'transparent'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <div>No signal data available</div>
                    <div className="text-sm mt-1">Waiting for connection...</div>
                  </div>
                )}
              </div>

              {/* Emergency override */}
              <div>
                <div className="text-sm font-medium mb-2 text-gray-700">Emergency Override</div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Manually override signal timing</div>
                    <div>
                      <Button
                        className={`${isEmergencyMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                        size="sm"
                        onClick={handleEmergencyOverride}
                      >
                        {isEmergencyMode ? 'Deactivate Override' : 'Emergency Override'}
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
      <Card className="border border-gray-200 bg-white shadow-md">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg text-gray-700">Signal Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: directionColors.North }}
                  >
                    North
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: directionColors.South }}
                  >
                    South
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: directionColors.East }}
                  >
                    East
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: directionColors.West }}
                  >
                    West
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    period: 'Morning Rush (6-9 AM)',
                    times: { North: 40, South: 35, East: 25, West: 25 }
                  },
                  {
                    period: 'Midday (9 AM-4 PM)',
                    times: { North: 30, South: 30, East: 30, West: 30 }
                  },
                  {
                    period: 'Evening Rush (4-7 PM)',
                    times: { North: 30, South: 40, East: 25, West: 25 }
                  },
                  {
                    period: 'Night (7 PM-6 AM)',
                    times: { North: 20, South: 20, East: 20, West: 20 }
                  }
                ].map((schedule) => {
                  const isActive = schedule.period === getCurrentTimePeriod();

                  return (
                    <tr
                      key={schedule.period}
                      className={`${isActive ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {schedule.period}
                      </td>
                      {Object.entries(schedule.times).map(([dir, time], index) => {
                        const dirColor = directionColors[dir as keyof typeof directionColors];
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                            style={{ color: isActive ? dirColor : 'rgb(75, 85, 99)' }}
                          >
                            {time}s
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {isActive ? 'Active' : 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}