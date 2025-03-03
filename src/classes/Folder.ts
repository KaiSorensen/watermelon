import { retrieveFolder, updateFolder } from '../supabase/databaseService';

export class Folder {
    private _id: string;
    private _ownerID: string;
    private _parentFolderID: string | null;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    // Constructor to create a Folder instance
    constructor(
        id: string,
        ownerID: string,
        parentFolderID: string | null,
        name: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this._id = id;
        this._ownerID = ownerID;
        this._parentFolderID = parentFolderID;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    // Factory method to create a Folder instance from database data
    static async fromId(id: string): Promise<Folder> {
        // Pass empty string instead of null for parentFolderID to fix type error
        const data = await retrieveFolder(id, "");
        return new Folder(
            data.id,
            data.ownerID,
            data.parentFolderID,
            data.name,
            new Date(data.createdAt),
            new Date(data.updatedAt)
        );
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
    get ownerID(): string { return this._ownerID; }
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
        // Pass empty string as second parameter to match function signature
        const data = await retrieveFolder(this._id, "");
        this._name = data.name;
        this._parentFolderID = data.parentFolderID;
        this._updatedAt = data.updatedAt;
    }
}