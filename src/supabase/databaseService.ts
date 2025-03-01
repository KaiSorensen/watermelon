import { Account, Folder, List, ListItem } from '../structs/types';
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

export async function retrieveAccount(userId: string): Promise<Account> {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', userId).single();
  if (error) {
    throw error;
  }
  
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    avatarURL: data.avatarURL,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    notifsEnabled: data.notifsEnabled
  };
}

export async function retrieveFolder(folderId: string): Promise<Folder> {
  const { data, error } = await supabase.from('folders').select('*').eq('id', folderId).single();
  if (error) {
    throw error;
  }
  
  return {
    id: data.id,
    userID: data.ownerID,
    parentFolderID: data.parentFolderID,
    name: data.name,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  };
}

export async function retrieveList(listId: string): Promise<List> {
  const { data, error } = await supabase.from('lists').select('*').eq('id', listId).single();
  if (error) {
    throw error;
  }
  
  return {
    id: data.id,
    ownerID: data.ownerID,
    folderID: data.parentFolderID,
    title: data.title,
    description: data.description,
    coverImageURL: data.coverImageURL,
    isPublic: data.isPublic,
    downloadCount: data.downloadCount,
    sortOrder: data.sortOrder as "date-first" | "date-last" | "alphabetical" | "manual",
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    settings: {
      today: data.today,
      notifications: {
        notifyOnNew: data.notifyOnNew,
        notifyTime: data.notifyTime ? new Date(data.notifyTime) : new Date(),
        notifyDays: data.notifyDays as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
      }
    }
  };
}

export async function retrieveListItem(listItemId: string): Promise<ListItem> {
  const { data, error } = await supabase.from('items').select('*').eq('id', listItemId).single();
  if (error) {
    throw error;
  }

  return {
    id: data.id,
    listID: data.listID,
    title: data.title,
    content: data.content,
    imageURLs: data.imageURLs,
    orderIndex: data.orderIndex,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt)
  };
}


