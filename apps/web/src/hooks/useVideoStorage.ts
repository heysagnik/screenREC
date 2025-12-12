'use client';

import { useState, useCallback } from 'react';

// Project manifest structure
export interface ProjectManifest {
    id: string;
    name: string;
    createdAt: number;
    duration: number;
    streams: {
        screen?: { filename: string; type: string; size: number };
        camera?: { filename: string; type: string; size: number };
        audio?: { filename: string; type: string; size: number };
    };
}

export interface ProjectStreams {
    screen?: Blob;
    camera?: Blob;
    audio?: Blob;
}

export interface ProjectUrls {
    screen?: string;
    camera?: string;
    audio?: string;
}

export function useVideoStorage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get OPFS root directory
    const getRoot = useCallback(async () => {
        try {
            return await navigator.storage.getDirectory();
        } catch {
            setError('OPFS not supported in this browser');
            return null;
        }
    }, []);

    // Save a complete project with multiple streams
    const saveProject = useCallback(async (
        streams: ProjectStreams,
        duration: number,
        name?: string
    ): Promise<string | null> => {
        setLoading(true);
        setError(null);

        try {
            const root = await getRoot();
            if (!root) return null;

            const projectId = `project-${Date.now()}`;
            const projectName = name || `Recording ${new Date().toLocaleString()}`;

            // Create project directory
            const projectsDir = await root.getDirectoryHandle('projects', { create: true });
            const projectDir = await projectsDir.getDirectoryHandle(projectId, { create: true });

            const manifest: ProjectManifest = {
                id: projectId,
                name: projectName,
                createdAt: Date.now(),
                duration,
                streams: {},
            };

            // Save screen stream
            if (streams.screen) {
                const filename = 'screen.webm';
                const handle = await projectDir.getFileHandle(filename, { create: true });
                const writable = await handle.createWritable();
                await writable.write(streams.screen);
                await writable.close();
                manifest.streams.screen = {
                    filename,
                    type: streams.screen.type,
                    size: streams.screen.size,
                };
            }

            // Save camera stream
            if (streams.camera) {
                const filename = 'camera.webm';
                const handle = await projectDir.getFileHandle(filename, { create: true });
                const writable = await handle.createWritable();
                await writable.write(streams.camera);
                await writable.close();
                manifest.streams.camera = {
                    filename,
                    type: streams.camera.type,
                    size: streams.camera.size,
                };
            }

            // Save audio stream
            if (streams.audio) {
                const filename = 'audio.webm';
                const handle = await projectDir.getFileHandle(filename, { create: true });
                const writable = await handle.createWritable();
                await writable.write(streams.audio);
                await writable.close();
                manifest.streams.audio = {
                    filename,
                    type: streams.audio.type,
                    size: streams.audio.size,
                };
            }

            // Save manifest
            const manifestHandle = await projectDir.getFileHandle('manifest.json', { create: true });
            const manifestWritable = await manifestHandle.createWritable();
            await manifestWritable.write(JSON.stringify(manifest, null, 2));
            await manifestWritable.close();

            setLoading(false);
            return projectId;
        } catch (e) {
            setError(`Failed to save project: ${e}`);
            setLoading(false);
            return null;
        }
    }, [getRoot]);

    // Load project manifest
    const loadProjectManifest = useCallback(async (projectId: string): Promise<ProjectManifest | null> => {
        try {
            const root = await getRoot();
            if (!root) return null;

            const projectsDir = await root.getDirectoryHandle('projects');
            const projectDir = await projectsDir.getDirectoryHandle(projectId);
            const manifestHandle = await projectDir.getFileHandle('manifest.json');
            const file = await manifestHandle.getFile();
            return JSON.parse(await file.text());
        } catch {
            return null;
        }
    }, [getRoot]);

    // Load project streams as blobs
    const loadProjectStreams = useCallback(async (projectId: string): Promise<ProjectStreams | null> => {
        setLoading(true);
        try {
            const root = await getRoot();
            if (!root) return null;

            const manifest = await loadProjectManifest(projectId);
            if (!manifest) return null;

            const projectsDir = await root.getDirectoryHandle('projects');
            const projectDir = await projectsDir.getDirectoryHandle(projectId);

            const streams: ProjectStreams = {};

            if (manifest.streams.screen) {
                const handle = await projectDir.getFileHandle(manifest.streams.screen.filename);
                streams.screen = await handle.getFile();
            }

            if (manifest.streams.camera) {
                const handle = await projectDir.getFileHandle(manifest.streams.camera.filename);
                streams.camera = await handle.getFile();
            }

            if (manifest.streams.audio) {
                const handle = await projectDir.getFileHandle(manifest.streams.audio.filename);
                streams.audio = await handle.getFile();
            }

            setLoading(false);
            return streams;
        } catch (e) {
            setError(`Failed to load project: ${e}`);
            setLoading(false);
            return null;
        }
    }, [getRoot, loadProjectManifest]);

    // Get blob URLs for project streams
    const getProjectUrls = useCallback(async (projectId: string): Promise<ProjectUrls | null> => {
        const streams = await loadProjectStreams(projectId);
        if (!streams) return null;

        return {
            screen: streams.screen ? URL.createObjectURL(streams.screen) : undefined,
            camera: streams.camera ? URL.createObjectURL(streams.camera) : undefined,
            audio: streams.audio ? URL.createObjectURL(streams.audio) : undefined,
        };
    }, [loadProjectStreams]);

    // List all projects
    const listProjects = useCallback(async (): Promise<ProjectManifest[]> => {
        try {
            const root = await getRoot();
            if (!root) return [];

            const projectsDir = await root.getDirectoryHandle('projects');
            const projects: ProjectManifest[] = [];

            for await (const [name] of projectsDir.entries()) {
                try {
                    const projectDir = await projectsDir.getDirectoryHandle(name);
                    const manifestHandle = await projectDir.getFileHandle('manifest.json');
                    const file = await manifestHandle.getFile();
                    const manifest = JSON.parse(await file.text());
                    projects.push(manifest);
                } catch {
                    // Skip invalid projects
                }
            }

            return projects.sort((a, b) => b.createdAt - a.createdAt);
        } catch {
            return [];
        }
    }, [getRoot]);

    // Delete project
    const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
        try {
            const root = await getRoot();
            if (!root) return false;

            const projectsDir = await root.getDirectoryHandle('projects');
            await projectsDir.removeEntry(projectId, { recursive: true });
            return true;
        } catch {
            return false;
        }
    }, [getRoot]);

    // Export using File System Access API
    const exportToFile = useCallback(async (
        blob: Blob,
        suggestedName: string = 'export.mp4'
    ): Promise<boolean> => {
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName,
                    types: [{
                        description: 'Video Files',
                        accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return true;
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = suggestedName;
                a.click();
                URL.revokeObjectURL(url);
                return true;
            }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') {
                setError(`Export failed: ${e}`);
            }
            return false;
        }
    }, []);

    return {
        loading,
        error,
        saveProject,
        loadProjectManifest,
        loadProjectStreams,
        getProjectUrls,
        listProjects,
        deleteProject,
        exportToFile,
    };
}
