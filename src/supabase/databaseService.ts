import { User } from '../classes/User';
import { Folder } from '../classes/Folder';
import { List } from '../classes/List';
import { Item } from '../classes/Item';
import { supabase } from './supabase';


// ======= SINGLE STORE FUNCTIONS =======


export function storeNewUser(user: User) {
  supabase.from('users').insert({
    id: user.id,
    username: user.username,
    email: user.email,
  })
  // populate default data for new user
  const folder1 = new Folder(user.id, user.id, null, "Wisdom", new Date(), new Date());
  storeNewFolder(folder1);
  addListToFolder(user.id, folder1.id, "761a664b-a03b-422f-ad90-f4bef41494d5"); // quotes

  const folder2 = new Folder(user.id, user.id, null, "Notes", new Date(), new Date());
  storeNewFolder(folder2);
  addListToFolder(user.id, folder2.id, "e9b7f235-6c0d-42d3-8b2a-c84ac8d267ff"); //poems
  addListToFolder(user.id, folder2.id, "2ba759e5-ec09-431d-b086-838a7e645c7f"); // insights
}

export function storeNewFolder(folder: Folder) {
  supabase.from('folders').insert({
    id: folder.id,
    name: folder.name,
    ownerID: folder.ownerID,
    parentFolderID: folder.parentFolderID
  })
}

export function storeNewList(list: List) {
  supabase.from('lists').insert({
    id: list.id,
    title: list.title,
    ownerID: list.ownerID,
    description: list.description,
    coverImageURL: list.coverImageURL,
    isPublic: list.isPublic,
    sortOrder: list.sortOrder,
    today: list.today,
    notifyOnNew: list.notifyOnNew,
    notifyTime: list.notifyTime?.toISOString(),
    notifyDays: list.notifyDays
  })
}

export function storeNewItem(item: Item) {
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


// ======= SINGLE RETRIEVE FUNCTIONS =======


export async function retrieveUser(userId: string): Promise<User> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) {
    throw error;
  }



  return new User(data.id, data.username, data.email, data.avatarURL, data.createdAt, data.updatedAt, data.notifsEnabled);
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

  return new Folder(data.id, data.ownerID, data.parentFolderID, data.name, data.createdAt, data.updatedAt);
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

  return new List(data.id, data.ownerID, data.title, data.description, data.coverImageURL, data.isPublic, data.sortOrder, data.createdAt, data.updatedAt, data.today, data.notifyOnNew, data.notifyTime, data.notifyDays);
}

export async function retrieveItem(itemId: string): Promise<Item> {
  const { data, error } = await supabase.from('items').select('*').eq('id', itemId).single();
  if (error) {
    throw error;
  }

  return new Item(data.id, data.listID, data.ownerID, data.title, data.content, data.imageURLs, data.orderIndex, data.createdAt, data.updatedAt);
}


// ======= SINGLE UPDATE FUNCTIONS =======


export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const { error } = await supabase
    .from('users')
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


// ======= SINGLE DELETE FUNCTIONS =======


export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) {
    throw error;
  }
}

export async function deleteFolder(folderId: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', folderId);
  if (error) {
    throw error;
  }
}

export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase.from('lists').delete().eq('id', listId);
  if (error) {
    throw error;
  }
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', itemId);
  if (error) {
    throw error;
  }
}


// ======= FOLDER-LISTS FUNCTIONS =======


export async function addListToFolder(ownerID: string, folderID: string, listID: string) {
  const { error } = await supabase.from('folderlists').insert({
    ownerID: ownerID,
    folderID: folderID,
    listID: listID
  });
  if (error) {
    throw error;
  }
}
export async function removeListFromFolder(ownerID: string, folderID: string, listID: string) {
  const { error } = await supabase.from('folderlists').delete().eq('ownerID', ownerID).eq('folderID', folderID).eq('listID', listID);
  if (error) {
    throw error;
  }
}


// ======= LIBRARY FUNCTIONS =======


export async function populateUserLists(user: User) {
  const { data, error } = await supabase.from('lists').select('*').eq('ownerID', user.id);
  if (error) {
    throw error;
  }

  const lists = data.map((list) => new List(list.id, list.ownerID, list.title, list.description, list.coverImageURL, list.isPublic, list.sortOrder, list.createdAt, list.updatedAt, list.today, list.notifyOnNew, list.notifyTime, list.notifyDays));
  user.lists = lists;
}

export async function populateFoldersListIDs(folder: Folder) {
  const { data, error } = await supabase.from('folderlists').select('listID').eq('folderID', folder.id);
  if (error) {
    throw error;
  }

  folder.listsIDs = data.map((list) => list.listID);
}

export async function populateFolders(user: User) {
  const { data, error } = await supabase.from('folders').select('*').eq('ownerID', user.id).eq('parentFolderID', null);
  if (error) {
    throw error;
  }

  const folders = data.map((folder) => new Folder(folder.id, folder.ownerID, folder.parentFolderID, folder.name, folder.createdAt, folder.updatedAt));
  user.rootFolders = folders;

  for (const folder of user.rootFolders) {
    await populateFoldersListIDs(folder);
    await populateSubFolders(folder);
  }
}

// recursive function to populate all subfolders given a root folder
export async function populateSubFolders(folder: Folder) {
  const { data, error } = await supabase.from('folders').select('*').eq('ownerID', folder.ownerID).eq('parentFolderID', folder.id);

  if (error) {
    throw error;
  }

  if (data === null || data.length === 0) {
    folder.subFolders = [];
    return;
  } 

  // Create Folder instances and directly assign to the folder's subFolders property
  folder.subFolders = data.map((folderData) => 
    new Folder(
      folderData.id, 
      folderData.ownerID, 
      folderData.parentFolderID, 
      folderData.name, 
      new Date(folderData.createdAt), 
      new Date(folderData.updatedAt)
    )
  );


  // Recursively populate subfolders for each subfolder
  for (const subFolder of folder.subFolders) {
    await populateFoldersListIDs(subFolder);
    await populateSubFolders(subFolder);
  }
}





// == SEARCH FUNCTIONS == given a user and a substring
// getPublicListsBySubstring
// getUserItemsBySubstring

// == TODAY FUNCTIONS == given a user
// getTodayListsForUser
// getTodayItemsForUser
// getNextItemForUser
// getPreviousItemForUser

// == LIST VIEW FUNCTIONS == given a list
// getItemsInList 
// getItemBySubstring  (maybe this is within the class)




