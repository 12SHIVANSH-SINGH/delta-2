'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

export default function AnalyticsPage() {
  // Sample data for traffic trends
  const [trafficTrends, setTrafficTrends] = useState<ChartData<'line'>>({
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'North',
        data: generateRandomData(24, 5, 40),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'South',
        data: generateRandomData(24, 5, 40),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'East',
        data: generateRandomData(24, 5, 40),
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'West',
        data: generateRandomData(24, 5, 40),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  
  // Sample data for emergency vehicle detection
  const [emergencyData, setEmergencyData] = useState<ChartData<'bar'>>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Emergency Vehicles',
        data: [3, 1, 4, 2, 5, 2, 1],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  });
  
  // Chart options
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)',
        }
      },
      title: {
        display: true,
        text: '24-Hour Traffic Trends',
        color: 'rgb(229, 231, 235)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      }
    },
  };
  
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)',
        }
      },
      title: {
        display: true,
        text: 'Weekly Emergency Vehicle Detections',
        color: 'rgb(229, 231, 235)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        }
      }
    },
  };
  
  // Function to generate random data points
  function generateRandomData(length: number, min: number, max: number): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  }
  
  // Sample traffic statistics
  const trafficStats = [
    { label: 'Total Vehicles Today', value: '14,328', change: '+12%', up: true },
    { label: 'Avg. Vehicles/Hour', value: '597', change: '+5%', up: true },
    { label: 'Peak Hour', value: '8:00 AM', change: '', up: false },
    { label: 'Emergency Vehicles', value: '18', change: '-8%', up: false },
  ];

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold">Traffic Analytics</h1>
      
      {/* Traffic statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trafficStats.map((stat) => (
          <Card key={stat.label} className="hover:bg-gray-800 transition-colors">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-400">{stat.label}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                {stat.change && (
                  <p className={`ml-2 text-sm ${stat.up ? 'text-success-400' : 'text-danger-400'}`}>
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
            {/* North direction */}
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium text-gray-300">North</div>
                <div className="text-sm font-medium text-gray-300">28%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            {/* South direction */}
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium text-gray-300">South</div>
                <div className="text-sm font-medium text-gray-300">32%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-success-500 h-2.5 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
            
            {/* East direction */}
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium text-gray-300">East</div>
                <div className="text-sm font-medium text-gray-300">24%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-warning-500 h-2.5 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
            
            {/* West direction */}
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm font-medium text-gray-300">West</div>
                <div className="text-sm font-medium text-gray-300">16%</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-danger-500 h-2.5 rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time Period
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
                    Cycle Length
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Morning (6-9 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">42s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">38s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">28s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">140s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Midday (9 AM-4 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">35s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">32s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">31s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">130s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Evening (4-7 PM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">36s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">45s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">30s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">34s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">145s</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Night (7 PM-6 AM)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">25s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">100s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}