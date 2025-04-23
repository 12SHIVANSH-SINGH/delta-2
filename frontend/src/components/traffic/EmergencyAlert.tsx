'use client';

import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { TrafficResponse } from '@/types';

interface EmergencyAlertProps {
  trafficData: TrafficResponse | null;
}

export default function EmergencyAlert({ trafficData }: EmergencyAlertProps) {
  const [emergencyLanes, setEmergencyLanes] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    if (!trafficData?.lanes) return;

    // Find lanes with emergency vehicles
    const lanes = Object.entries(trafficData.lanes)
      .filter(([_, data]) => data.emergency)
      .map(([lane]) => lane);

    if (lanes.length > 0 && !dismissed) {
      setEmergencyLanes(lanes);
      setShowAlert(true);
      
      // Play alert sound
      const audio = new Audio('/alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio playback prevented:', err));
    } else if (lanes.length === 0) {
      // Reset dismissed state when no emergency vehicles
      setDismissed(false);
      setShowAlert(false);
    }
  }, [trafficData, dismissed]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full animate-fade-in">
      <div className="bg-danger-600 border-l-4 border-danger-800 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              Emergency vehicle{emergencyLanes.length > 1 ? 's' : ''} detected in{' '}
              {emergencyLanes.join(', ')} lane{emergencyLanes.length > 1 ? 's' : ''}.
            </p>
            <p className="mt-1 text-xs opacity-80">
              Signal timing has been optimized to prioritize emergency vehicles.
            </p>
          </div>
          <button
            onClick={() => {
              setDismissed(true);
              setShowAlert(false);
            }}
            className="ml-4 text-white hover:text-gray-100 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}