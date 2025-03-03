import { retrieveList, updateList } from '../supabase/databaseService';

type SortOrder = "date-first" | "date-last" | "alphabetical" | "manual";
type NotifyDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface NotificationSettings {
    notifyOnNew: boolean;
    notifyTime: Date;
    notifyDays: NotifyDay;
}

interface ListSettings {
    today: boolean;
    notifications: NotificationSettings;
}

export class List {
    private _id: string;
    private _ownerID: string;
    private _folderID: string;
    private _title?: string;
    private _description: string;
    private _coverImageURL?: string;
    private _isPublic: boolean;
    private _downloadCount: number;
    private _sortOrder: SortOrder;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _settings: ListSettings;

    // Public constructor to enforce factory pattern
    public constructor(
        id: string,
        ownerID: string,
        folderID: string,
        title: string | undefined,
        description: string,
        coverImageURL: string | undefined,
        isPublic: boolean,
        downloadCount: number,
        sortOrder: SortOrder,
        createdAt: Date,
        updatedAt: Date,
        settings: ListSettings
    ) {
        this._id = id;
        this._ownerID = ownerID;
        this._folderID = folderID;
        this._title = title;
        this._description = description;
        this._coverImageURL = coverImageURL;
        this._isPublic = isPublic;
        this._downloadCount = downloadCount;
        this._sortOrder = sortOrder;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._settings = settings;
    }

    // Factory method to create a List instance from database data
    static async fromId(id: string): Promise<List> {
        const data = await retrieveList(id);
        return List.fromRaw(data);
    }

    // Factory method to create a List instance from raw data
    static fromRaw(data: any): List {
        return new List(
            data.id,
            data.ownerID,
            data.parentFolderID,
            data.title,
            data.description,
            data.coverImageURL,
            data.isPublic,
            data.downloadCount,
            data.sortOrder as SortOrder,
            new Date(data.createdAt),
            new Date(data.updatedAt),
            {
                today: data.today,
                notifications: {
                    notifyOnNew: data.notifyOnNew,
                    notifyTime: data.notifyTime ? new Date(data.notifyTime) : new Date(),
                    notifyDays: data.notifyDays as NotifyDay
                }
            }
        );
    }

    // Getters for read-only properties
    get id(): string { return this._id; }
    get ownerID(): string { return this._ownerID; }
    get folderID(): string { return this._folderID; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get title(): string | undefined { return this._title; }
    set title(value: string | undefined) { this._title = value; }

    get description(): string { return this._description; }
    set description(value: string) { this._description = value; }

    get coverImageURL(): string | undefined { return this._coverImageURL; }
    set coverImageURL(value: string | undefined) { this._coverImageURL = value; }

    get isPublic(): boolean { return this._isPublic; }
    set isPublic(value: boolean) { this._isPublic = value; }

    get downloadCount(): number { return this._downloadCount; }
    set downloadCount(value: number) { this._downloadCount = value; }

    get sortOrder(): SortOrder { return this._sortOrder; }
    set sortOrder(value: SortOrder) { this._sortOrder = value; }

    get settings(): ListSettings { return this._settings; }
    set settings(value: ListSettings) { this._settings = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateList(this._id, {
            title: this._title,
            description: this._description,
            coverImageURL: this._coverImageURL,
            isPublic: this._isPublic,
            downloadCount: this._downloadCount,
            sortOrder: this._sortOrder,
            settings: this._settings
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveList(this._id);
        this._title = data.title;
        this._description = data.description;
        this._coverImageURL = data.coverImageURL;
        this._isPublic = data.isPublic;
        this._downloadCount = data.downloadCount;
        this._sortOrder = data.sortOrder;
        this._settings = {
            today: data.settings.today,
            notifications: {
                notifyOnNew: data.settings.notifications.notifyOnNew,
                notifyTime: data.settings.notifications.notifyTime,
                notifyDays: data.settings.notifications.notifyDays
            }
        };
        this._updatedAt = data.updatedAt;
    }
}