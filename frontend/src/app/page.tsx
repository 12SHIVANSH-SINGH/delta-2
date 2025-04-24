'use client';

import { useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import TrafficCamera from '@/components/traffic/TrafficCamera';
import SignalVisualizer from '@/components/traffic/SignalVisualizer';
import EmergencyAlert from '@/components/traffic/EmergencyAlert';
import { api } from '@/lib/api';
import { TrafficResponse } from '@/types';
import { determineActiveSignal, formatTimestamp } from '@/lib/utils';
import VehicleCounts from '@/components/traffic/VehicleCounts';

export default function Dashboard() {
  const [trafficData, setTrafficData] = useState<TrafficResponse | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  useEffect(() => {
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

    return () => {
      subscription.close();
    };
  }, []);

  return (
    <div className="space-y-6 p-6 bg-[#f9fafb] text-black">
      {/* Emergency alert */}
      <EmergencyAlert trafficData={trafficData} />

      {/* Status header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Traffic Dashboard</h1>

        <div className="flex items-center text-sm space-x-4">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {lastUpdated && (
            <div className="text-gray-500">
              Last updated: {formatTimestamp(lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-600 rounded-lg p-3 text-sm text-red-700 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
          {error}
        </div>
      )}

      {/* Traffic cameras */}
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
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="opacity-70 shadow-sm bg-gray-200">
              <CardHeader>
                <CardTitle>
                  <div className="h-6 bg-gray-300 rounded-md animate-pulse w-24"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-300"></div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Signal + Vehicle Count with equal width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SignalVisualizer
          signalTimes={trafficData?.signal_times || {}}
          className="w-full"
        />

        {trafficData ? (
          <div className="w-full">
            <VehicleCounts
              data={{
                North: { count: trafficData.lanes.North?.count || 0, change: 0 },
                South: { count: trafficData.lanes.South?.count || 0, change: -3 },
                East: { count: trafficData.lanes.East?.count || 0, change: -3 },
                West: { count: trafficData.lanes.West?.count || 0, change: 0 },
              }}
            />
          </div>
        ) : (
          <Card className="bg-white shadow border border-gray-300 w-full">
            <CardHeader className="border-b border-gray-300">
              <CardTitle className="text-black">Vehicle Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded-md animate-pulse w-24"></div>
                <div className="h-6 bg-gray-300 rounded-md animate-pulse w-full"></div>
                <div className="h-6 bg-gray-300 rounded-md animate-pulse w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
