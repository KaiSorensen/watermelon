import { Account } from '../classes/Account';
import { Folder } from '../classes/Folder';
import { List } from '../classes/List';
import { Item } from '../classes/Item';
import { supabase } from './supabase';

export function storeUser(user: Account) {
  supabase.from('accounts').insert({
    id: user.id,
    username: user.username,
    email: user.email,
  })
}

export function storeFolder(folder: Folder) {
  supabase.from('folders').insert({
    id: folder.id,
    name: folder.name,
    ownerID: folder.ownerID,
    parentFolderID: folder.parentFolderID
  })
}

export function storeList(list: List) {
  supabase.from('lists').insert({
    id: list.id,
    title: list.title,
    ownerID: list.ownerID,
    description: list.description,
    coverImageURL: list.coverImageURL,
    isPublic: list.isPublic,
    downloadCount: list.downloadCount,
    sortOrder: list.sortOrder,
    today: list.today,
    notifyOnNew: list.notifyOnNew,
    notifyTime: list.notifyTime?.toISOString(),
    notifyDays: list.notifyDays
  })
}

export function storeItem(item: Item) {
  supabase.from('items').insert({
    id: item.id,
    listID: item.listID,
    ownerID: item.ownerID,
    title: item.title,
    content: item.content,
    imageURLs: item.imageURLs,
    orderIndex: item.orderIndex
  })
}

export async function retrieveAccount(userId: string): Promise<Account> {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', userId).single();
  if (error) {
    throw error;
  }

  return Account.fromRaw(data);
}

export async function retrieveFolder(folderId: string, ownerID: string): Promise<Folder> {
  let query = supabase.from('folders').select('*');
  
  if (folderId) {
    query = query.eq('id', folderId);
  }
  
  if (ownerID) {
    query = query.eq('ownerID', ownerID);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    throw error;
  }

  return Folder.fromRaw(data);
}

export async function retrieveList(ownerID: string, parentFolderID: string, listId: string): Promise<List> {
  let query = supabase.from('lists').select('*');
  
  if (listId) {
    query = query.eq('id', listId);
  }
  
  if (ownerID) {
    query = query.eq('ownerID', ownerID);
  }
  
  if (parentFolderID) {
    query = query.eq('parentFolderID', parentFolderID);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    throw error;
  }

  return List.fromRaw(data);
}

export async function retrieveItem(itemId: string): Promise<Item> {
  const { data, error } = await supabase.from('items').select('*').eq('id', itemId).single();
  if (error) {
    throw error;
  }

  return Item.fromRaw(data);
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
      today: updates.today,
      notifyOnNew: updates.notifyOnNew,
      notifyTime: updates.notifyTime?.toISOString(),
      notifyDays: updates.notifyDays,
      updatedAt: new Date().toISOString()
    })
    .eq('id', listId);

  if (error) {
    throw error;
  }
}

export async function updateItem(itemId: string, updates: Partial<Item>): Promise<void> {
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


