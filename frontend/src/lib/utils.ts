import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats seconds into a readable time format (mm:ss)
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Determines the active signal based on timing data
 */
export function determineActiveSignal(timings: Record<string, number>): string | null {
    // Find the direction with the highest time allocation
    if (!timings || Object.keys(timings).length === 0) return null;

    return Object.entries(timings)
        .sort(([, a], [, b]) => b - a)
        .map(([dir]) => dir)[0];
}

/**
 * Converts a base64 image to a displayable URL
 */
export function base64ToImageUrl(base64String: string): string {
    if (!base64String) return '';
    return `data:image/jpeg;base64,${base64String}`;
}

/**
 * Formats a timestamp to a readable format
 */
export function formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';

    try {
        // If it's an ISO timestamp
        if (timestamp.includes('T')) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        }

        // Already a formatted time
        return timestamp;
    } catch (e) {
        return timestamp;
    }
}

/**
 * Formats a duration in seconds to a human-readable format
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Gets a status color based on a vehicle count
 */
export function getStatusColor(count: number): string {
    if (count >= 30) return 'danger';
    if (count >= 15) return 'warning';
    return 'success';
}