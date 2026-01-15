export type FileType = 'file' | 'folder';

export interface VirtualFile {
    id: string; // Unique ID (uuid)
    name: string;
    type: FileType;
    content?: string; // Only for files
    children?: VirtualFile[]; // Only for folders
    isOpen?: boolean; // UI state
    language?: string; // 'html', 'css', 'javascript', etc.
}

export interface FileSystemState {
    root: VirtualFile[];
}
