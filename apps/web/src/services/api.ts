const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ConvertOptions {
    onProgress?: (progress: number) => void;
}

/**
 * Convert video blob to MP4 using backend API
 */
export async function convertToMp4(
    videoBlob: Blob,
    options?: ConvertOptions
): Promise<Blob | null> {
    try {
        const formData = new FormData();
        formData.append('video', videoBlob, 'recording.webm');

        options?.onProgress?.(10);

        const response = await fetch(`${API_URL}/api/convert`, {
            method: 'POST',
            body: formData,
        });

        options?.onProgress?.(50);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Conversion failed' }));
            const errorMsg = error.message || 'Conversion failed';

            if (errorMsg.includes('ffmpeg') && errorMsg.includes('not recognized')) {
                throw new Error('FFmpeg not installed on server. Please install FFmpeg or deploy to Railway.');
            }
            throw new Error(errorMsg);
        }

        options?.onProgress?.(90);

        const mp4Blob = await response.blob();

        options?.onProgress?.(100);

        return mp4Blob;
    } catch (error) {
        console.error('API conversion error:', error);
        throw error;
    }
}

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}
