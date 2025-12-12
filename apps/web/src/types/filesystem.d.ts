// File System Access API Type Definitions
// https://wicg.github.io/file-system-access/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}

interface SaveFilePickerOptions {
    excludeAcceptAllOption?: boolean;
    id?: string;
    suggestedName?: string;
    types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
    }>;
}

interface OpenFilePickerOptions extends SaveFilePickerOptions {
    multiple?: boolean;
}

interface DirectoryPickerOptions {
    id?: string;
    mode?: 'read' | 'readwrite';
}

// Augment existing FileSystemDirectoryHandle with entries() method
declare global {
    interface FileSystemDirectoryHandle {
        entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
        keys(): AsyncIterableIterator<string>;
        values(): AsyncIterableIterator<FileSystemHandle>;
    }

    interface Window {
        showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
        showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
        showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
    }
}

export { };
