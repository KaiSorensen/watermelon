import { Account } from '../classes/Account';
import { Folder } from '../classes/Folder';
import { List } from '../classes/List';
import { ListItem } from '../classes/Item';
import { supabase } from '../supabase';

export function storeUser(user: Account) {
  supabase.from('accounts').insert({
    id: user.id,
    username: user.username,
    email: user.email,
  })
}

export function storeFolder(ownerId: string, parentFolderId: string, folder: Folder) {
  supabase.from('folders').insert({
    id: folder.id,
    name: folder.name,
    ownerID: ownerId,
    parentFolderID: parentFolderId,
  })
}

export function storeList(ownerId: string, folderId: string, list: List) {
  supabase.from('lists').insert({
    id: list.id,
    name: list.title,
    ownerID: ownerId,
    folderID: folderId,
  })
}


export function storeListItem(listItem: ListItem) {
  supabase.from('items').insert({
    id: listItem.id,
    title: listItem.title,
    content: listItem.content,
    imageURLs: listItem.imageURLs,
    orderIndex: listItem.orderIndex,
  })
}

// Raw data conversion functions
function convertRawAccount(data: any): Account {
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

function convertRawFolder(data: any): Folder {
  return new Folder(
    data.id,
    data.ownerID,
    data.parentFolderID,
    data.name,
    new Date(data.createdAt),
    new Date(data.updatedAt)
  );
}

function convertRawList(data: any): List {
  return new List(
    data.id,
    data.ownerID,
    data.parentFolderID,
    data.title,
    data.description,
    data.coverImageURL,
    data.isPublic,
    data.downloadCount,
    data.sortOrder as "date-first" | "date-last" | "alphabetical" | "manual",
    new Date(data.createdAt),
    new Date(data.updatedAt),
    {
      today: data.today,
      notifications: {
        notifyOnNew: data.notifyOnNew,
        notifyTime: data.notifyTime ? new Date(data.notifyTime) : new Date(),
        notifyDays: data.notifyDays as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
      }
    }
  );
}

function convertRawListItem(data: any): ListItem {
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

export async function retrieveAccount(userId: string): Promise<Account> {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', userId).single();
  if (error) {
    throw error;
  }
  
  return Account.fromRaw(data);
}

export async function retrieveFolder(folderId: string): Promise<Folder> {
  const { data, error } = await supabase.from('folders').select('*').eq('id', folderId).single();
  if (error) {
    throw error;
  }
  
  return Folder.fromRaw(data);
}

export async function retrieveList(listId: string): Promise<List> {
  const { data, error } = await supabase.from('lists').select('*').eq('id', listId).single();
  if (error) {
    throw error;
  }
  
  return List.fromRaw(data);
}

export async function retrieveListItem(listItemId: string): Promise<ListItem> {
  const { data, error } = await supabase.from('items').select('*').eq('id', listItemId).single();
  if (error) {
    throw error;
  }

  return ListItem.fromRaw(data);
}

export async function updateAccount(userId: string, updates: Partial<Account>): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .update({
      username: updates.username,
      email: updates.email,
      avatarURL: updates.avatarURL,
      notifsEnabled: updates.notifsEnabled,
      updatedAt: new Date().toISOString()
    })
    .eq('id', userId);
    
  if (error) {
    throw error;
  }
}

export async function updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .update({
      name: updates.name,
      parentFolderID: updates.parentFolderID,
      updatedAt: new Date().toISOString()
    })
    .eq('id', folderId);
    
  if (error) {
    throw error;
  }
}

export async function updateList(listId: string, updates: Partial<List>): Promise<void> {
  const { error } = await supabase
    .from('lists')
    .update({
      title: updates.title,
      description: updates.description,
      coverImageURL: updates.coverImageURL,
      isPublic: updates.isPublic,
      downloadCount: updates.downloadCount,
      sortOrder: updates.sortOrder,
      today: updates.settings?.today,
      notifyOnNew: updates.settings?.notifications.notifyOnNew,
      notifyTime: updates.settings?.notifications.notifyTime?.toISOString(),
      notifyDays: updates.settings?.notifications.notifyDays,
      updatedAt: new Date().toISOString()
    })
    .eq('id', listId);
    
  if (error) {
    throw error;
  }
}

export async function updateListItem(itemId: string, updates: Partial<ListItem>): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({
      title: updates.title,
      content: updates.content,
      imageURLs: updates.imageURLs,
      orderIndex: updates.orderIndex,
      updatedAt: new Date().toISOString()
    })
    .eq('id', itemId);
    
  if (error) {
    throw error;
  }
}


