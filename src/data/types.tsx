export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    preferences?: {
        theme: 'light' | 'dark';
        notificationsEnabled: boolean;
    };
}

export interface ListItem {
    id: string;
    listId: string;
    userId: string;
    content: string;
    title?: string;
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface List {
    id: string;
    userId: string;
    name: string;
    description?: string;
    items: ListItem[];
    isPublic: boolean;
    downloadCount: number;
    parentFolderId?: string | null;
    coverImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    settings: {
        showInToday: boolean;
        notifyOnNew: boolean;
    };
}

export interface Folder {
    id: string;
    userId: string;
    name: string;
    parentFolderId?: string | null;
    folders: Folder[];
    lists: List[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Library {
    rootFolders: Folder[];
}