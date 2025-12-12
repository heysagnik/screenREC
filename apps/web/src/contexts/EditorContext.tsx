'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { EditorState, EditorAction, Track, Clip } from '@/types/editor';

const initialState: EditorState = {
    projectId: '',
    projectName: 'Untitled Project',
    duration: 0,
    playhead: 0,
    isPlaying: false,
    zoom: 1,
    tracks: [],
    selectedClipId: null,
    selectedTrackId: null,
    history: [],
    historyIndex: -1,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case 'SET_PLAYHEAD':
            return { ...state, playhead: Math.max(0, Math.min(action.payload, state.duration)) };
        case 'SET_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'SET_ZOOM':
            return { ...state, zoom: Math.max(0.1, Math.min(10, action.payload)) };
        case 'SELECT_CLIP':
            return { ...state, selectedClipId: action.payload };
        case 'SELECT_TRACK':
            return { ...state, selectedTrackId: action.payload };
        case 'UPDATE_CLIP':
            return {
                ...state,
                tracks: state.tracks.map(track => ({
                    ...track,
                    clips: track.clips.map(clip =>
                        clip.id === action.payload.clipId ? { ...clip, ...action.payload.updates } : clip
                    ),
                })),
            };
        case 'DELETE_CLIP':
            return {
                ...state,
                tracks: state.tracks.map(track => ({
                    ...track,
                    clips: track.clips.filter(clip => clip.id !== action.payload),
                })),
                selectedClipId: state.selectedClipId === action.payload ? null : state.selectedClipId,
            };
        case 'SPLIT_CLIP': {
            const { clipId, splitTime } = action.payload;
            return {
                ...state,
                tracks: state.tracks.map(track => {
                    const clipIndex = track.clips.findIndex(c => c.id === clipId);
                    if (clipIndex === -1) return track;
                    const clip = track.clips[clipIndex];
                    const relativeTime = splitTime - clip.startTime;
                    if (relativeTime <= 0 || relativeTime >= clip.duration) return track;
                    const firstClip: Clip = {
                        ...clip,
                        duration: relativeTime,
                        sourceEnd: clip.sourceStart + relativeTime,
                    };
                    const secondClip: Clip = {
                        ...clip,
                        id: `${clip.id}-split-${Date.now()}`,
                        startTime: splitTime,
                        duration: clip.duration - relativeTime,
                        sourceStart: clip.sourceStart + relativeTime,
                    };
                    const newClips = [...track.clips];
                    newClips.splice(clipIndex, 1, firstClip, secondClip);
                    return { ...track, clips: newClips };
                }),
            };
        }
        case 'TOGGLE_TRACK_MUTE':
            return {
                ...state,
                tracks: state.tracks.map(track =>
                    track.id === action.payload ? { ...track, muted: !track.muted } : track
                ),
            };
        case 'TOGGLE_TRACK_LOCK':
            return {
                ...state,
                tracks: state.tracks.map(track =>
                    track.id === action.payload ? { ...track, locked: !track.locked } : track
                ),
            };
        case 'TOGGLE_CLIP_MUTE':
            return {
                ...state,
                tracks: state.tracks.map(track => ({
                    ...track,
                    clips: track.clips.map(clip =>
                        clip.id === action.payload ? { ...clip, muted: !clip.muted } : clip
                    ),
                })),
            };
        case 'SET_CLIP_SPEED':
            return {
                ...state,
                tracks: state.tracks.map(track => ({
                    ...track,
                    clips: track.clips.map(clip =>
                        clip.id === action.payload.clipId ? { ...clip, speed: action.payload.speed } : clip
                    ),
                })),
            };
        case 'SET_CLIP_VOLUME':
            return {
                ...state,
                tracks: state.tracks.map(track => ({
                    ...track,
                    clips: track.clips.map(clip =>
                        clip.id === action.payload.clipId ? { ...clip, volume: action.payload.volume } : clip
                    ),
                })),
            };
        case 'SET_TRACKS':
            return { ...state, tracks: action.payload };
        case 'SET_DURATION':
            return { ...state, duration: action.payload };
        case 'PUSH_HISTORY': {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({ ...state, history: [], historyIndex: -1 });
            return { ...state, history: newHistory.slice(-50), historyIndex: newHistory.length - 1 };
        }
        case 'UNDO': {
            if (state.historyIndex < 0) return state;
            const prevState = state.history[state.historyIndex];
            return { ...prevState, history: state.history, historyIndex: state.historyIndex - 1 };
        }
        case 'REDO': {
            if (state.historyIndex >= state.history.length - 1) return state;
            const nextState = state.history[state.historyIndex + 1];
            return { ...nextState, history: state.history, historyIndex: state.historyIndex + 1 };
        }
        default:
            return state;
    }
}

interface EditorContextValue {
    state: EditorState;
    dispatch: React.Dispatch<EditorAction>;
    setPlayhead: (time: number) => void;
    togglePlay: () => void;
    selectClip: (clipId: string | null) => void;
    deleteSelectedClip: () => void;
    splitAtPlayhead: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    undo: () => void;
    redo: () => void;
    toggleClipMute: (clipId: string) => void;
    setClipSpeed: (clipId: string, speed: number) => void;
    canUndo: boolean;
    canRedo: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children, initialTracks = [] }: { children: ReactNode; initialTracks?: Track[] }) {
    const [state, dispatch] = useReducer(editorReducer, {
        ...initialState,
        tracks: initialTracks,
        duration: initialTracks.reduce((max, track) => {
            const trackEnd = track.clips.reduce((end, clip) => Math.max(end, clip.startTime + clip.duration), 0);
            return Math.max(max, trackEnd);
        }, 0),
    });

    const pushHistory = useCallback(() => {
        dispatch({ type: 'PUSH_HISTORY' });
    }, []);

    const setPlayhead = useCallback((time: number) => {
        dispatch({ type: 'SET_PLAYHEAD', payload: time });
    }, []);

    const togglePlay = useCallback(() => {
        dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying });
    }, [state.isPlaying]);

    const selectClip = useCallback((clipId: string | null) => {
        dispatch({ type: 'SELECT_CLIP', payload: clipId });
    }, []);

    const deleteSelectedClip = useCallback(() => {
        if (state.selectedClipId) {
            pushHistory();
            dispatch({ type: 'DELETE_CLIP', payload: state.selectedClipId });
        }
    }, [state.selectedClipId, pushHistory]);

    const splitAtPlayhead = useCallback(() => {
        if (state.selectedClipId) {
            pushHistory();
            dispatch({ type: 'SPLIT_CLIP', payload: { clipId: state.selectedClipId, splitTime: state.playhead } });
        }
    }, [state.selectedClipId, state.playhead, pushHistory]);

    const zoomIn = useCallback(() => {
        dispatch({ type: 'SET_ZOOM', payload: state.zoom * 1.2 });
    }, [state.zoom]);

    const zoomOut = useCallback(() => {
        dispatch({ type: 'SET_ZOOM', payload: state.zoom / 1.2 });
    }, [state.zoom]);

    const undo = useCallback(() => {
        dispatch({ type: 'UNDO' });
    }, []);

    const redo = useCallback(() => {
        dispatch({ type: 'REDO' });
    }, []);

    const toggleClipMute = useCallback((clipId: string) => {
        pushHistory();
        dispatch({ type: 'TOGGLE_CLIP_MUTE', payload: clipId });
    }, [pushHistory]);

    const setClipSpeed = useCallback((clipId: string, speed: number) => {
        pushHistory();
        dispatch({ type: 'SET_CLIP_SPEED', payload: { clipId, speed } });
    }, [pushHistory]);

    return (
        <EditorContext.Provider
            value={{
                state,
                dispatch,
                setPlayhead,
                togglePlay,
                selectClip,
                deleteSelectedClip,
                splitAtPlayhead,
                zoomIn,
                zoomOut,
                undo,
                redo,
                toggleClipMute,
                setClipSpeed,
                canUndo: state.historyIndex >= 0,
                canRedo: state.historyIndex < state.history.length - 1,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
}

export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within EditorProvider');
    }
    return context;
}
