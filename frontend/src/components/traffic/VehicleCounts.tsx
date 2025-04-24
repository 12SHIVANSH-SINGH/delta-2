import { Car, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface VehicleData {
  count: number;
  change?: number;
  emergency?: boolean;
}

interface VehicleCountsProps {
  data: {
    [key: string]: VehicleData;
  };
}

const VehicleCounts = ({ data }: VehicleCountsProps) => {
  const getDirectionColor = (direction: string) => {
    const colors = {
      North: 'bg-[#4287f5]', // Blue
      South: 'bg-[#34c759]', // Green
      East: 'bg-[#ff9500]',  // Orange
      West: 'bg-[#af52de]'   // Purple
    };
    return colors[direction as keyof typeof colors] || 'bg-gray-400';
  };

  // Calculate total vehicles
  const totalVehicles = Object.values(data).reduce((sum, lane) => sum + lane.count, 0);
  
  // Count emergency vehicles
  const emergencyVehicles = Object.entries(data).filter(([_, data]) => data.emergency).length;

  return (
    <Card className="bg-white shadow-sm rounded-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-gray-900 font-semibold">Vehicle Counts</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Total and Emergency summary */}
        <div className="flex mb-6 gap-4">
          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-600 mb-2">Total Vehicles</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{totalVehicles}</div>
              <div className="bg-gray-700 p-2 rounded-full">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
            <div className="text-gray-600 mb-2">Emergency</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{emergencyVehicles}</div>
              <div className="bg-red-600 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Direction breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data).map(([direction, { count, change, emergency }]) => (
            <div key={direction} className={`bg-gray-50 p-4 rounded-lg ${emergency ? 'ring-1 ring-red-300' : ''}`}>
              <div className="text-gray-600 mb-2">{direction}</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{count}</div>
                <div className={`${getDirectionColor(direction)} p-2 rounded-full`}>
                  <Car className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                
                {emergency && (
                  <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                    Emergency
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCounts;