'use client';

import { useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import TrafficCamera from '@/components/traffic/TrafficCamera';
import SignalVisualizer from '@/components/traffic/SignalVisualizer';
import EmergencyAlert from '@/components/traffic/EmergencyAlert';
import { api } from '@/lib/api';
import { TrafficResponse, Direction } from '@/types';
import { determineActiveSignal, formatTimestamp } from '@/lib/utils';

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState<TrafficResponse | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time traffic data
    const subscription = api.subscribeToTrafficFeed(
      (data) => {
        setTrafficData(data);
        setConnected(true);
        setError(null);
        setLastUpdated(data.timestamp || new Date().toISOString());
        setActiveSignal(determineActiveSignal(data.signal_times));
      },
      (error) => {
        console.error('Error subscribing to traffic feed:', error);
        setConnected(false);
        setError('Failed to connect to traffic data feed');
      }
    );

    // Cleanup on component unmount
    return () => {
      subscription.close();
    };
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Emergency alert */}
      <EmergencyAlert trafficData={trafficData} />

      {/* Status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Traffic Dashboard</h1>

        <div className="flex items-center text-sm space-x-4">
          <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {lastUpdated && (
            <div className="text-gray-400">
              Last updated: {formatTimestamp(lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-danger-600 bg-opacity-20 border border-danger-700 rounded-lg p-3 text-sm text-danger-200 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-danger-500" />
          {error}
        </div>
      )}

      {/* Traffic cameras grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trafficData && trafficData.lanes ? (
          Object.entries(trafficData.lanes).map(([direction, data]) => (
            <TrafficCamera
              key={direction}
              direction={direction}
              data={data}
              signalTime={trafficData.signal_times[direction]}
              isActive={activeSignal === direction}
            />
          ))
        ) : (
          // Placeholder loading cards
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="opacity-70">
              <CardHeader>
                <CardTitle>
                  <div className="h-6 bg-gray-700 rounded-md animate-pulse w-24"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900"></div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Signal timing visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SignalVisualizer
          signalTimes={trafficData?.signal_times || {}}
          className="lg:col-span-2"
        />

        {/* Traffic info card */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficData ? (
              <div className="space-y-4">
                {/* Total vehicles */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Vehicles</div>
                  <div className="text-2xl font-bold">
                    {Object.values(trafficData.lanes).reduce(
                      (sum, lane) => sum + lane.count,
                      0
                    )}
                  </div>
                </div>

                {/* Per-direction breakdown */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Distribution</div>
                  <div className="space-y-2">
                    {Object.entries(trafficData.lanes).map(([direction, data]) => (
                      <div key={direction} className="flex justify-between items-center">
                        <div className="text-sm">{direction}</div>
                        <div className="flex items-center">
                          <div className="h-2 bg-primary-500 rounded-full mr-2"
                            style={{
                              width: `${Math.min(100, data.count * 4)}px`,
                              backgroundColor: `var(--color-${(Object.keys(trafficData.lanes).indexOf(direction) % 5) + 1})`,
                            }}>
                          </div>
                          <div className="text-sm">{data.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency vehicles */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Emergency Vehicles</div>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold mr-2">
                      {Object.values(trafficData.lanes).filter(lane => lane.emergency).length}
                    </div>
                    {Object.entries(trafficData.lanes)
                      .filter(([_, data]) => data.emergency)
                      .map(([direction]) => (
                        <span key={direction} className="bg-danger-600 text-white text-xs px-2 py-1 rounded-full mr-1">
                          {direction}
                        </span>
                      ))
                    }
                  </div>
                </div>

                {/* System status */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex items-center text-gray-400 text-xs">
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    <span>System operating normally</span>
                  </div>
                </div>
              </div>
            ) : (
              // Placeholder loading state
              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded-md animate-pulse w-24"></div>
                <div className="h-6 bg-gray-700 rounded-md animate-pulse w-full"></div>
                <div className="h-6 bg-gray-700 rounded-md animate-pulse w-2/3"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}