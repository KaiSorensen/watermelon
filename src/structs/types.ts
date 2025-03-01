export type Account = {
    id: string; // UUID
    username: string;
    email: string;
    avatarURL?: string; // Profile image URL
    createdAt: Date;
    updatedAt: Date;
    notifsEnabled: boolean;
};

export type Folder = {
    id: string;
    userID: string; // Owner
    parentFolderID?: string | null; // Null if it's a root folder
    name: string;
    createdAt: Date;
    updatedAt: Date;
};


export type List = {
    id: string;
    ownerID: string;
    folderID: string; // Folder ID if it's inside a folder
    title?: string;
    description: string;
    coverImageURL?: string; // Optional list cover image
    isPublic: boolean;
    downloadCount: number;
    sortOrder: "date-first" | "date-last" | "alphabetical" | "manual";
    createdAt: Date;
    updatedAt: Date;
    settings: {
        today: boolean;
        notifications: {
            notifyOnNew: boolean;
            notifyTime: Date;
            notifyDays: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        }
    };
};

export type ListItem = {
    id: string;
    listID: string; // Parent list
    title?: string;
    content: string; // Markdown/HTML for rich text
    imageURLs?: string[]; // Array of image URLs if images are embedded
    orderIndex?: number; // For manual sorting
    createdAt: Date;
    updatedAt: Date;
};