import { retrieveItem, updateItem } from '../supabase/databaseService';

export class Item {
    private _id: string;
    private _listID: string;
    private _ownerID: string;
    private _title: string | null;
    private _content: string;
    private _imageURLs: string[] | null;
    private _orderIndex: number | null;
    private _createdAt: Date;
    private _updatedAt: Date;

    // Constructor to create an Item instance
    constructor(
        id: string,
        listID: string,
        ownerID: string,
        title: string | null,
        content: string,
        imageURLs: string[] | null,
        orderIndex: number | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        this._id = id;
        this._listID = listID;
        this._ownerID = ownerID;
        this._title = title;
        this._content = content;
        this._imageURLs = imageURLs;
        this._orderIndex = orderIndex;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    // Factory method to create an Item instance from database data
    static async fromId(id: string): Promise<Item> {
        const data = await retrieveItem(id);
        return Item.fromRaw(data);
    }

    // Factory method to create an Item instance from raw data
    static fromRaw(data: any): Item {
        return new Item(
            data.id,
            data.listID,
            data.ownerID,
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
    get ownerID(): string { return this._ownerID; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    // Getters and setters for mutable properties
    get title(): string | null { return this._title; }
    set title(value: string | null) { this._title = value; }

    get content(): string { return this._content; }
    set content(value: string) { this._content = value; }

    get imageURLs(): string[] | null { return this._imageURLs; }
    set imageURLs(value: string[] | null) { this._imageURLs = value; }

    get orderIndex(): number | null { return this._orderIndex; }
    set orderIndex(value: number | null) { this._orderIndex = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateItem(this._id, {
            title: this._title,
            content: this._content,
            imageURLs: this._imageURLs,
            orderIndex: this._orderIndex
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveItem(this._id);
        this._title = data.title;
        this._content = data.content;
        this._imageURLs = data.imageURLs;
        this._orderIndex = data.orderIndex;
        this._updatedAt = new Date(data.updatedAt);
    }
}