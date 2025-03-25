import { retrieveUser, updateUser } from '../supabase/databaseService';
import { Folder } from './Folder';
import { List } from './List';
export class User {
    private _id: string;
    private _username: string;
    private _email: string;
    private _avatarURL: string | null;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _notifsEnabled: boolean;

    // these are not in User table of the database, but they get populated when logged in
    private _rootFolders: Folder[];
    private _listMap: Map<string, List>;

    // Constructor to create an User instance
    constructor(
        id: string,
        username: string,
        email: string,
        avatarURL: string | null,
        createdAt: Date,
        updatedAt: Date,
        notifsEnabled: boolean
    ) {
        this._id = id;
        this._username = username;
        this._email = email;
        this._avatarURL = avatarURL;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._notifsEnabled = notifsEnabled;

        this._rootFolders = [];
        this._listMap = new Map<string, List>();
    }

    // Getters for read-only properties
    get id(): string { return this._id; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get username(): string { return this._username; }
    set username(value: string) { this._username = value; }

    get email(): string { return this._email; }
    set email(value: string) { this._email = value; }

    get avatarURL(): string | null { return this._avatarURL; }
    set avatarURL(value: string | null) { this._avatarURL = value; }

    get notifsEnabled(): boolean { return this._notifsEnabled; }
    set notifsEnabled(value: boolean) { this._notifsEnabled = value; }

    get rootFolders(): Folder[] { return this._rootFolders; }
    set rootFolders(value: Folder[]) { this._rootFolders = value; }

    get listMap(): Map<string, List> { return this._listMap; }
    set listMap(value: Map<string, List>) { this._listMap = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateUser(this._id, {
            username: this._username,
            email: this._email,
            avatarURL: this._avatarURL,
            notifsEnabled: this._notifsEnabled
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveUser(this._id);

        if (data === null) {
            throw new Error('User not found');
        }

        this._username = data.username;
        this._email = data.email;
        this._avatarURL = data.avatarURL;
        this._notifsEnabled = data.notifsEnabled;
        this._updatedAt = new Date(data.updatedAt);
    }

    public addRootFolder(folder: Folder) {
        this._rootFolders.push(folder);
    }
    public removeRootFolder(folder: Folder) {
        this._rootFolders = this._rootFolders.filter(f => f.id !== folder.id);
    }

    public addList(list: List) {
        this._listMap.set(list.id, list);
        const folder = this.getFolder(list.folderID);
        if (folder) {
            folder.addList(list);
        } else {
            throw new Error('Folder not found');
        }
    }
    public removeList(list: List) {
        this._listMap.delete(list.id);
        const folder = this.getFolder(list.folderID);
        if (folder) {
            folder.removeList(list);
        } else {
            throw new Error('Folder not found');
        }
    }

    public addFolder(folder: Folder) {
        if (folder.parentFolderID === null) {
            this._rootFolders.push(folder);
        } else {
            const parentFolder = this.getFolder(folder.parentFolderID);
            if (parentFolder) {
                parentFolder.subFolders.push(folder);
            } else {
                throw new Error('Parent folder not found');
            }
        }
    }

    public removeFolder(folder: Folder) {
        if (folder.parentFolderID === null) {
            this._rootFolders = this._rootFolders.filter(f => f.id !== folder.id);
        } else {
            const parentFolder = this.getFolder(folder.parentFolderID);
            if (parentFolder) {
                parentFolder.subFolders = parentFolder.subFolders.filter(f => f.id !== folder.id);
            } else {
                throw new Error('Parent folder not found');
            }
        }
    }

    public getFolder(folderId: string) {
        const folders = this.getAllFolders();
        return folders.find(f => f.id === folderId);
    }

    public getList(listId: string) {
        return this._listMap.get(listId);
    }

    public getAllFolders() {
        const folders = [...this._rootFolders];
        for (const folder of folders) {
            folders.push(...folder.subFolders);
        }
        return folders;
    }

    public getTodayLists() {
        return Array.from(this._listMap.values()).filter(l => l.today);
    }
}

