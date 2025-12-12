export interface ConvertRequest {
    format: 'mp4' | 'webm';
    quality?: '720p' | '1080p' | '4k';
}

export interface ConvertResponse {
    success: boolean;
    message?: string;
    filename?: string;
}

export interface ApiError {
    error: string;
    code?: string;
}
