import { retrieveAccount, updateAccount } from '../supabase/databaseService';

export class Account {
    private _id: string;
    private _username: string;
    private _email: string;
    private _avatarURL?: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _notifsEnabled: boolean;

    // Public constructor to enforce factory pattern
    public constructor(
        id: string,
        username: string,
        email: string,
        avatarURL: string | undefined,
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
    }

    // Factory method to create an Account instance from database data
    static async fromId(id: string): Promise<Account> {
        const data = await retrieveAccount(id);
        return Account.fromRaw(data);
    }

    // Factory method to create an Account instance from raw data
    static fromRaw(data: any): Account {
        return new Account(
            data.id,
            data.username,
            data.email,
            data.avatarURL,
            new Date(data.createdAt),
            new Date(data.updatedAt),
            data.notifsEnabled
        );
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

    get avatarURL(): string | undefined { return this._avatarURL; }
    set avatarURL(value: string | undefined) { this._avatarURL = value; }

    get notifsEnabled(): boolean { return this._notifsEnabled; }
    set notifsEnabled(value: boolean) { this._notifsEnabled = value; }

    // Method to save changes to the database
    async save(): Promise<void> {
        await updateAccount(this._id, {
            username: this._username,
            email: this._email,
            avatarURL: this._avatarURL,
            notifsEnabled: this._notifsEnabled
        });
        this._updatedAt = new Date();
    }

    // Method to refresh data from the database
    async refresh(): Promise<void> {
        const data = await retrieveAccount(this._id);
        this._username = data.username;
        this._email = data.email;
        this._avatarURL = data.avatarURL;
        this._notifsEnabled = data.notifsEnabled;
        this._updatedAt = data.updatedAt;
    }
}

