'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { api } from '@/lib/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LaneInfo {
  count: number;
  emergency: boolean;
}

interface TrafficData {
  lanes: {
    [key: string]: LaneInfo;
  };
  signal_times: {
    [key: string]: number;
  };
}

export default function AnalyticsPage() {
  // State for real-time data
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [historicalData, setHistoricalData] = useState<{ [key: string]: number[] }>({
    North: [],
    South: [],
    East: [],
    West: []
  });
  const [emergencyHistory, setEmergencyHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [connected, setConnected] = useState(false);

  // Subscribe to real-time traffic data
  useEffect(() => {
    const subscription = api.subscribeToTrafficFeed(
      (data: TrafficData) => {
        setTrafficData(data);
        setConnected(true);

        // Update historical data
        setHistoricalData(prev => {
          const newData = { ...prev };
          Object.entries(data.lanes).forEach(([direction, info]) => {
            newData[direction] = [...(prev[direction] || []), info.count].slice(-24);
          });
          return newData;
        });

        // Update emergency vehicle history
        const emergencyCount = Object.values(data.lanes).filter(lane => lane.emergency).length;
        setEmergencyHistory(prev => {
          const newHistory = [...prev.slice(1), emergencyCount];
          return newHistory;
        });
      },
      (error) => {
        console.error('Error in traffic feed:', error);
        setConnected(false);
      }
    );

    return () => subscription.close();
  }, []);

  // Traffic trends chart data
  const trafficTrends: ChartData<'line'> = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: Object.entries(historicalData).map(([direction, data], index) => {
      const colors = [
        { border: 'rgba(59, 130, 246, 1)', bg: 'rgba(59, 130, 246, 0.1)' },
        { border: 'rgba(16, 185, 129, 1)', bg: 'rgba(16, 185, 129, 0.1)' },
        { border: 'rgba(245, 158, 11, 1)', bg: 'rgba(245, 158, 11, 0.1)' },
        { border: 'rgba(239, 68, 68, 1)', bg: 'rgba(239, 68, 68, 0.1)' }
      ];

      return {
        label: direction,
        data: data,
        borderColor: colors[index].border,
        backgroundColor: colors[index].bg,
        fill: true,
        tension: 0.4,
      };
    }),
  };

  // Emergency vehicles chart data
  const emergencyData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Emergency Vehicles',
        data: emergencyHistory,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  };

  // Chart options
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      },
      title: {
        display: true,
        text: '24-Hour Traffic Trends',
        color: 'rgb(55, 65, 81)', // Changed to gray-700
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      }
    },
  };
  
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      },
      title: {
        display: true,
        text: 'Weekly Emergency Vehicle Detections',
        color: 'rgb(55, 65, 81)', // Changed to gray-700
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(55, 65, 81)', // Changed to gray-700
        }
      }
    },
  };
  // Calculate current traffic statistics
  const calculateTrafficStats = () => {
    if (!trafficData) return [];

    const totalVehicles = Object.values(trafficData.lanes).reduce((sum, lane) => sum + lane.count, 0);
    const avgVehiclesPerHour = Math.round(totalVehicles / 24);
    const emergencyCount = Object.values(trafficData.lanes).filter(lane => lane.emergency).length;

    return [
      {
        label: 'Total Vehicles Today',
        value: totalVehicles.toLocaleString(),
        change: '+12%',
        up: true
      },
      {
        label: 'Avg. Vehicles/Hour',
        value: avgVehiclesPerHour.toLocaleString(),
        change: '+5%',
        up: true
      },
      {
        label: 'Peak Hour',
        value: '8:00 AM',
        change: '',
        up: false
      },
      {
        label: 'Emergency Vehicles',
        value: emergencyCount.toString(),
        change: emergencyCount > 0 ? '+100%' : '-100%',
        up: emergencyCount > 0
      },
    ];
  };

  // Calculate traffic distribution
  const calculateDistribution = () => {
    if (!trafficData) return {};

    const total = Object.values(trafficData.lanes).reduce((sum, lane) => sum + lane.count, 0);
    return Object.entries(trafficData.lanes).reduce((acc: Record<string, number>, [direction, data]) => {
      acc[direction] = total > 0 ? Math.round((data.count / total) * 100) : 0;
      return acc;
    }, {});
  };

  const distribution = calculateDistribution();
  const trafficStats = calculateTrafficStats();

  return (
    <div className="space-y-6 p-6 bg-[#f9fafb]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Traffic Analytics</h1>
        <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
          <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Traffic statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trafficStats.map((stat) => (
          <Card key={stat.label} className="hover:bg-gray-800 transition-colors">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-black">{stat.label}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-700">{stat.value}</p>
                {stat.change && (
                  <p className={`ml-2 text-sm ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic trends chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                options={lineOptions}
                data={trafficTrends}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency vehicles chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                options={barOptions}
                data={emergencyData}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Distribution by Direction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(distribution).map(([direction, percentage]) => (
              <div key={direction}>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium text-black">{direction}</div>
                  <div className="text-sm font-medium text-black">{percentage}%</div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${direction === 'North' ? 'bg-blue-500' :
                        direction === 'South' ? 'bg-green-500' :
                          direction === 'East' ? 'bg-yellow-500' :
                            'bg-red-500'
                      }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signal timing analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Signal Timing Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Time Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    North
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    South
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    East
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    West
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Cycle Length
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {trafficData && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      Current
                    </td>
                    {Object.entries(trafficData.signal_times).map(([direction, time]) => (
                      <td key={direction} className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {time}s
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {Object.values(trafficData.signal_times).reduce((a, b) => a + b, 0)}s
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    Morning (6-9 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">42s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">38s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">28s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">140s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    Midday (9 AM-4 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">35s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">31s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">130s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    Evening (4-7 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">36s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">45s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">34s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">145s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    Night (7 PM-6 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">100s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}