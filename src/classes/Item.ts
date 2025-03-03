import { retrieveListItem, updateListItem } from '../supabase/databaseService';

export class ListItem {
    private _id: string;
    private _listID: string;
    private _title?: string;
    private _content: string;
    private _imageURLs?: string[];
    private _orderIndex?: number;
    private _createdAt: Date;
    private _updatedAt: Date;

    // Private constructor to enforce factory pattern
    private constructor(
        id: string,
        listID: string,
        title: string | undefined,
        content: string,
        imageURLs: string[] | undefined,
        orderIndex: number | undefined,
        createdAt: Date,
        updatedAt: Date
    ) {
        this._id = id;
        this._listID = listID;
        this._title = title;
        this._content = content;
        this._imageURLs = imageURLs;
        this._orderIndex = orderIndex;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    // Factory method to create a ListItem instance from database data
    static async fromId(id: string): Promise<ListItem> {
        const data = await retrieveListItem(id);
        return ListItem.fromRaw(data);
    }

    // Factory method to create a ListItem instance from raw data
    static fromRaw(data: any): ListItem {
        return new ListItem(
            data.id,
            data.listID,
            data.title,
            data.content,
            data.imageURLs,
            data.orderIndex,
            new Date(data.createdAt),
            new Date(data.updatedAt)
        );
    }

    // Getters for read-only properties
    get id(): string { return this._id; }
    get listID(): string { return this._listID; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get title(): string | undefined { return this._title; }
    set title(value: string | undefined) { this._title = value; }

    get content(): string { return this._content; }
    set content(value: string) { this._content = value; }

    get imageURLs(): string[] | undefined { return this._imageURLs; }
    set imageURLs(value: string[] | undefined) { this._imageURLs = value; }

    get orderIndex(): number | undefined { return this._orderIndex; }
    set orderIndex(value: number | undefined) { this._orderIndex = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateListItem(this._id, {
            title: this._title,
            content: this._content,
            imageURLs: this._imageURLs,
            orderIndex: this._orderIndex
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveListItem(this._id);
        this._title = data.title;
        this._content = data.content;
        this._imageURLs = data.imageURLs;
        this._orderIndex = data.orderIndex;
        this._updatedAt = data.updatedAt;
    }
}