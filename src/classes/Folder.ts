import { retrieveFolder, updateFolder } from '../supabase/databaseService';
import { List } from './List';

export class Folder {
    private _id: string;
    private _ownerID: string;
    private _parentFolderID: string | null;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    // these are not in Folder table of the database, but they get populated when logged in
    private _subFolders: Folder[];
    private _listsIDs: string[]; // ids, because the User object contains the List objects for less complicated lookups for Today tab

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

        this._subFolders = [];
        this._listsIDs = [];
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

    get subFolders(): Folder[] { return this._subFolders; }
    set subFolders(value: Folder[]) { this._subFolders = value; }

    get listsIDs(): string[] { return this._listsIDs; }
    set listsIDs(value: string[]) { this._listsIDs = value; }

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

    public addList(list: List) {
        this._listsIDs.push(list.id);
    }
    public removeList(list: List) {
        this._listsIDs = this._listsIDs.filter(id => id !== list.id);
    }

    public isEmpty(): boolean {
        return this._listsIDs.length === 0 && this._subFolders.length === 0;
    }
}