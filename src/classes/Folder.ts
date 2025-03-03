import { retrieveFolder, updateFolder } from '../supabase/databaseService';

export class Folder {
    private _id: string;
    private _userID: string;
    private _parentFolderID: string | null;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    // Private constructor to enforce factory pattern
    private constructor(
        id: string,
        userID: string,
        parentFolderID: string | null,
        name: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this._id = id;
        this._userID = userID;
        this._parentFolderID = parentFolderID;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    // Factory method to create a Folder instance from database data
    static async fromId(id: string): Promise<Folder> {
        const data = await retrieveFolder(id);
        return Folder.fromRaw(data);
    }

    // Factory method to create a Folder instance from raw data
    static fromRaw(data: any): Folder {
        return new Folder(
            data.id,
            data.ownerID,
            data.parentFolderID,
            data.name,
            new Date(data.createdAt),
            new Date(data.updatedAt)
        );
    }

    // Getters for read-only properties
    get id(): string { return this._id; }
    get userID(): string { return this._userID; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get parentFolderID(): string | null { return this._parentFolderID; }
    set parentFolderID(value: string | null) { this._parentFolderID = value; }

    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateFolder(this._id, {
            name: this._name,
            parentFolderID: this._parentFolderID
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveFolder(this._id);
        this._name = data.name;
        this._parentFolderID = data.parentFolderID;
        this._updatedAt = data.updatedAt;
    }
}