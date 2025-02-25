type User = {
    id: string; // UUID
    username: string;
    email: string;
    avatarUrl?: string; // Profile image URL
    createdAt: Date;
    updatedAt: Date;
    preferences: {
        theme: "light" | "dark";
        notificationsEnabled: boolean;
    };
};

type Folder = {
    id: string;
    userId: string; // Owner
    parentFolderId?: string | null; // Null if it's a root folder
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

type List = {
    id: string;
    userId: string;
    parentFolderId?: string | null; // Folder ID if it's inside a folder
    title: string;
    description?: string;
    coverImageUrl?: string; // Optional list cover image
    isPublic: boolean;
    sortOrder: "manual" | "alphabetical" | "recent";
    createdAt: Date;
    updatedAt: Date;
};

type ListItem = {
    id: string;
    listId: string; // Parent list
    userId: string;
    title?: string;
    content: string; // Markdown/HTML for rich text
    imageUrls?: string[]; // Array of image URLs if images are embedded
    orderIndex?: number; // For manual sorting
    createdAt: Date;
    updatedAt: Date;
};

export type { User, Folder, List, ListItem };