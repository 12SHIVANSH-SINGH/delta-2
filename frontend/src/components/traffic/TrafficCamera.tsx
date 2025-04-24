'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrafficData } from '@/types';
import { base64ToImageUrl, getStatusColor } from '@/lib/utils';

interface TrafficCameraProps {
  direction: string;
  data?: TrafficData;
  signalTime?: number;
  isActive?: boolean;
}

export default function TrafficCamera({ 
  direction, 
  data, 
  signalTime = 0,
  isActive = false
}: TrafficCameraProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Convert base64 image when data changes
    if (data?.image) {
      setImageUrl(base64ToImageUrl(data.image));
    }
  }, [data]);

  // Status color based on vehicle count
  const statusColor = data ? getStatusColor(data.count) : 'success';

  return (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-green-500' : ''}`}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{direction}</CardTitle>
        <div className="flex items-center space-x-2">
          {data?.emergency && (
            <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs animate-pulse">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Emergency
            </div>
          )}
          <div className={`px-2 py-1 rounded-full text-xs font-medium 
            ${statusColor === 'danger' ? 'bg-red-100 text-red-700' : 
              statusColor === 'warning' ? 'bg-amber-100 text-amber-700' : 
              'bg-green-100 text-green-700'}`}>
            {data?.count || 0} vehicles
          </div>
          {isActive && (
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div className="aspect-video bg-blue-50 relative overflow-hidden">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={`${direction} traffic camera`}
              className="object-cover"
              fill={true}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-blue-300">
              No feed available
            </div>
          )}

          {/* Signal time overlay */}
          {signalTime > 0 && (
            <div className={`absolute bottom-3 right-3 ${
              isActive ? 'bg-green-500' : 'bg-black'
            } text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {signalTime}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
