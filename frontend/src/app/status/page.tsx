'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { HealthCheckResponse, MetricsResponse } from '@/types';
import { formatDuration } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function StatusPage() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch health and metrics data
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [health, metrics] = await Promise.all([
        api.getHealth(),
        api.getMetrics()
      ]);
      
      setHealthData(health);
      setMetricsData(metrics);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up polling every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">System Status</h1>
        
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          onClick={fetchData}
          isLoading={isRefreshing}
        >
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* System overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* System status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  {healthData?.status === 'running' ? (
                    <>
                      <div className="h-10 w-10 rounded-full bg-success-500 bg-opacity-20 flex items-center justify-center mr-3">
                        <CheckCircleIcon className="h-6 w-6 text-success-500" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Operational</div>
                        <div className="text-sm text-success-400">All systems running</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-danger-500 bg-opacity-20 flex items-center justify-center mr-3">
                        <XCircleIcon className="h-6 w-6 text-danger-500" />
                      </div>
                      <div>
                        <div className="font-medium text-white">System Error</div>
                        <div className="text-sm text-danger-400">Check system logs</div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Uptime</span>
                    <span className="text-white">{formatDuration(healthData?.uptime || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Active clients</span>
                    <span className="text-white">{healthData?.active_clients || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Last checked</span>
                    <span className="text-white">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Detector status */}
            <Card>
              <CardHeader>
                <CardTitle>AI Detector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  {healthData?.detector === 'ok' ? (
                    <>
                      <div className="h-10 w-10 rounded-full bg-success-500 bg-opacity-20 flex items-center justify-center mr-3">
                        <CheckCircleIcon className="h-6 w-6 text-success-500" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Online</div>
                        <div className="text-sm text-success-400">YOLOv8 detector operational</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-danger-500 bg-opacity-20 flex items-center justify-center mr-3">
                        <XCircleIcon className="h-6 w-6 text-danger-500" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Detector Error</div>
                        <div className="text-sm text-danger-400">{healthData?.detector || 'Unknown error'}</div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Model</span>
                    <span className="text-white">YOLOv8n</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Confidence threshold</span>
                    <span className="text-white">0.4</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={healthData?.detector === 'ok' ? 'text-success-400' : 'text-danger-400'}>
                      {healthData?.detector === 'ok' ? 'Operational' : 'Error'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cache Age</div>
                    <div className="text-2xl font-bold">
                      {metricsData ? `${Math.round(metricsData.cache_age_seconds * 100) / 100}s` : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Active Connections</div>
                    <div className="text-2xl font-bold">
                      {metricsData?.active_connections || 0}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Last Updated</div>
                    <div className="text-sm">
                      {metricsData?.timestamp ? new Date(metricsData.timestamp).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Camera Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Camera Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Direction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {healthData && Object.entries(healthData.sources).map(([lane, status]) => (
                      <tr key={lane}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {lane}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {healthData.sources[lane].includes('file not found')
                            ? <span className="text-danger-400">File not found</span>
                            : <span className="text-gray-300">videos/{lane.toLowerCase()}.mp4</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {status === 'ok' ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-success-500 bg-opacity-20 text-success-400">
                              Operational
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-danger-500 bg-opacity-20 text-danger-400">
                              {status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* System Log (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>System Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded-md font-mono text-xs text-gray-300 h-48 overflow-y-auto">
                <div className="text-success-400">[INFO] System started successfully</div>
                <div className="text-gray-400">[INFO] YOLOv8 detector initialized</div>
                <div className="text-gray-400">[INFO] Connected to video sources</div>
                <div className="text-warning-400">[WARN] North camera feed has low framerate</div>
                <div className="text-gray-400">[INFO] Traffic optimizer calibrated</div>
                <div className="text-danger-400">[ERROR] Failed to process frame from East camera at 14:32:17</div>
                <div className="text-gray-400">[INFO] Emergency vehicle detected in South lane</div>
                <div className="text-gray-400">[INFO] Signal timing adjusted for emergency vehicle</div>
                <div className="text-gray-400">[INFO] Cache refreshed</div>
                <div className="text-success-400">[INFO] System health check passed</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}