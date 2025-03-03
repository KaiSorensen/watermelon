import { retrieveList, updateList } from '../supabase/databaseService';

type SortOrder = "date-first" | "date-last" | "alphabetical" | "manual";
type NotifyDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export class List {
    private _id: string;
    private _ownerID: string;
    private _title: string;
    private _description: string | null;
    private _coverImageURL: string | null;
    private _isPublic: boolean;
    private _downloadCount: number;
    private _sortOrder: SortOrder;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _today: boolean;
    private _notifyOnNew: boolean;
    private _notifyTime: Date | null;
    private _notifyDays: NotifyDay | null;

    // Constructor to create a List instance
    constructor(
        id: string,
        ownerID: string,
        title: string,
        description: string | null,
        coverImageURL: string | null,
        isPublic: boolean,
        downloadCount: number,
        sortOrder: SortOrder,
        createdAt: Date,
        updatedAt: Date,
        today: boolean,
        notifyOnNew: boolean,
        notifyTime: Date | null,
        notifyDays: NotifyDay | null
    ) {
        this._id = id;
        this._ownerID = ownerID;
        this._title = title;
        this._description = description;
        this._coverImageURL = coverImageURL;
        this._isPublic = isPublic;
        this._downloadCount = downloadCount;
        this._sortOrder = sortOrder;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._today = today;
        this._notifyOnNew = notifyOnNew;
        this._notifyTime = notifyTime;
        this._notifyDays = notifyDays;
    }

    // Factory method to create a List instance from database data
    static async fromId(id: string): Promise<List> {
        // Pass required parameters to match function signature
        const data = await retrieveList("", "", id);
        return List.fromRaw(data);
    }

    // Factory method to create a List instance from raw data
    static fromRaw(data: any): List {
        return new List(
            data.id,
            data.ownerID,
            data.title,
            data.description,
            data.coverImageURL,
            data.isPublic,
            data.downloadCount,
            data.sortOrder as SortOrder,
            new Date(data.createdAt),
            new Date(data.updatedAt),
            data.today,
            data.notifyOnNew,
            data.notifyTime ? new Date(data.notifyTime) : null,
            data.notifyDays as NotifyDay
        );
    }

    // Getters for read-only properties
    get id(): string { return this._id; }
    get ownerID(): string { return this._ownerID; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get title(): string { return this._title; }
    set title(value: string) { this._title = value; }

    get description(): string | null { return this._description; }
    set description(value: string | null) { this._description = value; }

    get coverImageURL(): string | null { return this._coverImageURL; }
    set coverImageURL(value: string | null) { this._coverImageURL = value; }

    get isPublic(): boolean { return this._isPublic; }
    set isPublic(value: boolean) { this._isPublic = value; }

    get downloadCount(): number { return this._downloadCount; }
    set downloadCount(value: number) { this._downloadCount = value; }

    get sortOrder(): SortOrder { return this._sortOrder; }
    set sortOrder(value: SortOrder) { this._sortOrder = value; }

    get today(): boolean { return this._today; }
    set today(value: boolean) { this._today = value; }

    get notifyOnNew(): boolean { return this._notifyOnNew; }
    set notifyOnNew(value: boolean) { this._notifyOnNew = value; }

    get notifyTime(): Date | null { return this._notifyTime; }
    set notifyTime(value: Date | null) { this._notifyTime = value; }

    get notifyDays(): NotifyDay | null { return this._notifyDays; }
    set notifyDays(value: NotifyDay | null) { this._notifyDays = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateList(this._id, {
            title: this._title,
            description: this._description,
            coverImageURL: this._coverImageURL,
            isPublic: this._isPublic,
            downloadCount: this._downloadCount,
            sortOrder: this._sortOrder,
            today: this._today,
            notifyOnNew: this._notifyOnNew,
            notifyTime: this._notifyTime,
            notifyDays: this._notifyDays
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        // Pass required parameters to match function signature
        const data = await retrieveList("", "", this._id);
        this._title = data.title;
        this._description = data.description;
        this._coverImageURL = data.coverImageURL;
        this._isPublic = data.isPublic;
        this._downloadCount = data.downloadCount;
        this._sortOrder = data.sortOrder;
        this._today = data.today;
        this._notifyOnNew = data.notifyOnNew;
        this._notifyTime = data.notifyTime ? new Date(data.notifyTime) : null;
        this._notifyDays = data.notifyDays;
        this._updatedAt = new Date(data.updatedAt);
    }
}