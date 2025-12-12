export type TrackType = 'screen' | 'webcam' | 'audio';

export interface Clip {
    id: string;
    trackId: string;
    startTime: number;
    duration: number;
    sourceStart: number;
    sourceEnd: number;
    mediaUrl: string;
    type: 'video' | 'audio';
    name: string;
    speed: number;
    muted: boolean;
    volume: number;
}

export interface Track {
    id: string;
    type: TrackType;
    name: string;
    muted: boolean;
    locked: boolean;
    clips: Clip[];
    color: string;
}

export interface EditorState {
    projectId: string;
    projectName: string;
    duration: number;
    playhead: number;
    isPlaying: boolean;
    zoom: number;
    tracks: Track[];
    selectedClipId: string | null;
    selectedTrackId: string | null;
    history: EditorState[];
    historyIndex: number;
}

export interface EditorProject {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    screenBlob?: Blob;
    webcamBlob?: Blob;
    audioBlob?: Blob;
    state: EditorState;
}

export type EditorAction =
    | { type: 'SET_PLAYHEAD'; payload: number }
    | { type: 'SET_PLAYING'; payload: boolean }
    | { type: 'SET_ZOOM'; payload: number }
    | { type: 'SELECT_CLIP'; payload: string | null }
    | { type: 'SELECT_TRACK'; payload: string | null }
    | { type: 'UPDATE_CLIP'; payload: { clipId: string; updates: Partial<Clip> } }
    | { type: 'DELETE_CLIP'; payload: string }
    | { type: 'SPLIT_CLIP'; payload: { clipId: string; splitTime: number } }
    | { type: 'TOGGLE_TRACK_MUTE'; payload: string }
    | { type: 'TOGGLE_TRACK_LOCK'; payload: string }
    | { type: 'TOGGLE_CLIP_MUTE'; payload: string }
    | { type: 'SET_CLIP_SPEED'; payload: { clipId: string; speed: number } }
    | { type: 'SET_CLIP_VOLUME'; payload: { clipId: string; volume: number } }
    | { type: 'SET_TRACKS'; payload: Track[] }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'PUSH_HISTORY' };

