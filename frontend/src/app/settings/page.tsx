'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { CameraSource } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [cameraSources, setCameraSources] = useState<CameraSource>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load current camera sources
    const loadCameraSources = async () => {
      try {
        const sources = await api.getCameraSources();
        setCameraSources(sources);
      } catch (error) {
        console.error('Error loading camera sources:', error);
        toast.error('Failed to load camera settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCameraSources();
  }, []);
  
  const handleInputChange = (lane: string, value: string) => {
    setCameraSources(prev => ({
      ...prev,
      [lane]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await api.updateCameraSources(cameraSources);
      toast.success('Camera settings saved successfully');
    } catch (error) {
      console.error('Error saving camera sources:', error);
      toast.error('Failed to save camera settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Camera Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {['North', 'South', 'East', 'West'].map(lane => (
                  <div key={lane} className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(cameraSources).map(([lane, source]) => (
                  <div key={lane}>
                    <label htmlFor={`camera-${lane}`} className="text-sm font-medium text-gray-300 block mb-1">
                      {lane} Camera Source
                    </label>
                    <input
                      type="text"
                      id={`camera-${lane}`}
                      value={source}
                      onChange={(e) => handleInputChange(lane, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-300"
                      placeholder="Enter video source path"
                    />
                  </div>
                ))}
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Save Camera Settings
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
      
      <Card>
        <CardHeader>
          <CardTitle>Traffic Signal Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label htmlFor="min-green" className="text-sm font-medium text-gray-300 block mb-1">
                Minimum Green Time (seconds)
              </label>
              <input
                type="number"
                id="min-green"
                min="5"
                max="30"
                defaultValue="5"
                className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="max-green" className="text-sm font-medium text-gray-300 block mb-1">
                Maximum Green Time (seconds)
              </label>
              <input
                type="number"
                id="max-green"
                min="30"
                max="120"
                defaultValue="60"
                className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="emergency-priority" className="text-sm font-medium text-gray-300 block mb-1">
                Emergency Vehicle Priority
              </label>
              <select
                id="emergency-priority"
                defaultValue="high"
                className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-300"
              >
                <option value="low">Low (30% cycle time)</option>
                <option value="medium">Medium (50% cycle time)</option>
                <option value="high">High (70% cycle time)</option>
                <option value="maximum">Maximum (90% cycle time)</option>
              </select>
            </div>
            
            <div>
              <Button variant="primary">Save Signal Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label htmlFor="detection-confidence" className="text-sm font-medium text-gray-300 block mb-1">
                Detection Confidence Threshold
              </label>
              <input
                type="range"
                id="detection-confidence"
                min="0.1"
                max="0.9"
                step="0.1"
                defaultValue="0.4"
                className="w-full max-w-sm"
              />
              <div className="flex justify-between max-w-sm text-xs text-gray-400 mt-1">
                <span>Low (0.1)</span>
                <span>Medium (0.5)</span>
                <span>High (0.9)</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable-alerts"
                defaultChecked
                className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="enable-alerts" className="text-sm font-medium text-gray-300">
                Enable Emergency Vehicle Alerts
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="debug-mode"
                className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="debug-mode" className="text-sm font-medium text-gray-300">
                Enable Debug Mode
              </label>
            </div>
            
            <div>
              <Button variant="primary">Save System Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}