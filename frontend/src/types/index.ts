// Traffic data types
export interface TrafficData {
    count: number;
    emergency: boolean;
    image: string;
}

export interface TrafficResponse {
    lanes: Record<string, TrafficData>;
    signal_times: Record<string, number>;
    timestamp: string;
}

export interface CameraSource {
    [lane: string]: string;
}

// Health check types
export interface SourceStatus {
    [lane: string]: string;
}

export interface HealthCheckResponse {
    status: string;
    uptime: number;
    detector: string;
    sources: SourceStatus;
    active_clients: number;
    timestamp: string;
}

export interface MetricsResponse {
    active_connections: number;
    cache_age_seconds: number;
    timestamp: string;
}

// Direction type
export type Direction = 'North' | 'South' | 'East' | 'West';

// Signal status type
export type SignalStatus = 'red' | 'yellow' | 'green';

// Signal timing type
export interface SignalTiming {
    direction: Direction;
    duration: number;
    status: SignalStatus;
}