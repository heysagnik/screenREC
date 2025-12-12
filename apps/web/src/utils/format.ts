/**
 * Formatting utility functions
 * Shared across components for consistent formatting
 */

/**
 * Format bytes to human-readable file size
 * @param bytes - Number of bytes
 * @returns Formatted string like "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format seconds to MM:SS time string
 * @param seconds - Number of seconds
 * @returns Formatted string like "2:05"
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format number with compact notation (e.g., 1.2k)
 * @param n - Number to format
 * @returns Formatted string
 */
export function formatCompactNumber(n: number): string {
    try {
        return new Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(n);
    } catch {
        return String(n);
    }
}
