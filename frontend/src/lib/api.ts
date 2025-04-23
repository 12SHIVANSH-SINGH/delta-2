import axios from 'axios';
import { CameraSource, HealthCheckResponse, MetricsResponse, TrafficResponse } from '@/types';

// Base API URL - update this based on your deployment setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API endpoints
export const api = {
    /**
     * Health check endpoint to check system status
     */
    getHealth: async (): Promise<HealthCheckResponse> => {
        const response = await apiClient.get('/health');
        return response.data;
    },

    /**
     * Get system performance metrics
     */
    getMetrics: async (): Promise<MetricsResponse> => {
        const response = await apiClient.get('/metrics');
        return response.data;
    },

    /**
     * Get current camera sources configuration
     */
    getCameraSources: async (): Promise<CameraSource> => {
        const response = await apiClient.get('/camera_sources');
        return response.data;
    },

    /**
     * Update camera sources configuration
     */
    updateCameraSources: async (sources: CameraSource): Promise<any> => {
        const response = await apiClient.post('/camera_sources', sources);
        return response.data;
    },

    /**
     * Upload and analyze a traffic image
     */
    uploadImage: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload_image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Create an EventSource for real-time traffic data
     */
    subscribeToTrafficFeed: (onMessage: (data: TrafficResponse) => void, onError: (error: any) => void) => {
        const eventSource = new EventSource(`${API_BASE_URL}/traffic_feed`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing SSE data:', error);
                onError(error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            onError(error);
            eventSource.close();
        };

        return {
            close: () => eventSource.close(),
        };
    },
};

export default api;