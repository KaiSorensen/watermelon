import 'react-native-get-random-values';
import { User } from '../classes/User';
import { Folder } from '../classes/Folder';
import { List } from '../classes/List';
import { Item } from '../classes/Item';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Fallback UUID generator in case the standard one fails
function generateFallbackUUID() {
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where y is 8, 9, a, or b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Safe UUID generator that tries the standard method first, then falls back
function safeUUID() {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('Standard UUID generation failed, using fallback method:', error);
    return generateFallbackUUID();
  }
}

// ======= SINGLE STORE FUNCTIONS =======


export async function storeNewUser(user: User) {
  await supabase.from('users').insert({
    id: user.id,
    username: user.username,
    email: user.email,
  });
  
  // populate default data for new user
  console.log("storing folder 1");
  const folder1 = new Folder(safeUUID(), user.id, null, "Wisdom", new Date(), new Date());
  await storeNewFolder(folder1).then(async () => {
    await addListToFolder(user.id, folder1.id, "761a664b-a03b-422f-ad90-f4bef41494d5"); // quotes
  });
  console.log("folder 1 stored");

  console.log("storing folder 2");
  const folder2 = new Folder(safeUUID(), user.id, null, "Notes", new Date(), new Date());
  await storeNewFolder(folder2).then(async () => {
    await addListToFolder(user.id, folder2.id, "e9b7f235-6c0d-42d3-8b2a-c84ac8d267ff"); //poems
    await addListToFolder(user.id, folder2.id, "2ba759e5-ec09-431d-b086-838a7e645c7f"); // insights
  });
  console.log("folder 2 stored");
}

export async function storeNewFolder(folder: Folder) {
  await supabase.from('folders').insert({
    id: folder.id,
    name: folder.name,
    ownerID: folder.ownerID,
    parentFolderID: folder.parentFolderID
  });
}

export async function storeNewList(list: List) {
  await supabase.from('lists').insert({
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
  });
}

export async function storeNewItem(item: Item) {
  await supabase.from('items').insert({
    listID: item.listID,
    ownerID: item.ownerID,
    title: item.title,
    content: item.content,
    imageURLs: item.imageURLs,
    orderIndex: item.orderIndex
  });
}


// ======= SINGLE RETRIEVE FUNCTIONS =======


export async function retrieveUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) {
      console.error('Error retrieving user from database:', error);
      return null;
    }

    if (data === null) {
      console.log('User not found in database:', userId);
      return null;
    }

    const user = new User(data.id, data.username, data.email, data.avatarURL, data.createdAt, data.updatedAt, data.notifsEnabled);
    
    try {
      // Try to populate the user's library, but don't fail if it doesn't work
      await populateLibrary(user);
    } catch (libraryError) {
      console.error('Error populating user library:', libraryError);
      // Continue with the basic user object even if library population fails
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error in retrieveUser:', error);
    return null;
  }
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
  try {
    // First check if the list exists
    const { data: listData, error: listError } = await supabase
      .from('lists')
      .select('id')
      .eq('id', listID)
      .single();
    
    // If the list doesn't exist, create a default list
    if (listError || !listData) {
      console.log(`List ${listID} doesn't exist, creating a default list`);
      
      // Create a default list based on the ID
      let title = "Default List";
      if (listID === "761a664b-a03b-422f-ad90-f4bef41494d5") {
        title = "Quotes";
      } else if (listID === "e9b7f235-6c0d-42d3-8b2a-c84ac8d267ff") {
        title = "Poems";
      } else if (listID === "2ba759e5-ec09-431d-b086-838a7e645c7f") {
        title = "Insights";
      }
      
      await supabase.from('lists').insert({
        id: listID,
        ownerID: ownerID,
        title: title,
        description: "Default list created automatically",
        isPublic: false,
        sortOrder: "newest"
      });
    }
    
    // Now add the list to the folder
    const { error } = await supabase.from('folderlists').insert({
      ownerID: ownerID,
      folderID: folderID,
      listID: listID
    });
    
    if (error) {
      console.error('Error adding list to folder:', error);
    }
  } catch (error) {
    console.error('Unexpected error in addListToFolder:', error);
  }
}
export async function removeListFromFolder(ownerID: string, folderID: string, listID: string) {
  const { error } = await supabase.from('folderlists').delete().eq('ownerID', ownerID).eq('folderID', folderID).eq('listID', listID);
  if (error) {
    throw error;
  }
}


// ======= LIBRARY FUNCTIONS =======


export async function populateLibrary(user: User) {
  try {
    await populateFolders(user);
  } catch (folderError) {
    console.error('Error populating folders:', folderError);
    // Initialize empty folders to prevent null references
    user.rootFolders = [];
  }
  
  try {
    await populateUserLists(user);
  } catch (listsError) {
    console.error('Error populating user lists:', listsError);
    // Initialize empty list map to prevent null references
    user.listMap = new Map();
  }
}

export async function populateUserLists(user: User) {
  try {
    const { data, error } = await supabase.from('folderlists').select('listID').eq('ownerID', user.id);

    if (error) {
      console.error('Error fetching user lists:', error);
      user.listMap = new Map();
      return;
    }

    const listIDs = data.map((list) => list.listID);
    const lists: List[] = [];
    for (const listID of listIDs) {
      const { data: listData, error: listError } = await supabase.from('lists').select('*').eq('id', listID).single();
      if (listError) {
        console.error('Error fetching user lists:', listError);
        user.listMap = new Map();
        return;
      }
      lists.push(new List(listData.id, listData.ownerID, listData.title, listData.description, listData.coverImageURL, listData.isPublic, listData.sortOrder, listData.createdAt, listData.updatedAt, listData.today, listData.notifyOnNew, listData.notifyTime, listData.notifyDays));
    }
    

    for (const listID of listIDs) {
      const { data: listData, error: listError } = await supabase.from('lists').select('*').eq('id', listID).single();
      if (listError) {
        console.error('Error fetching user lists:', listError);
        user.listMap = new Map();
        return;
      }
    }

    user.listMap = new Map(lists.map((list) => [list.id, list]));
  } catch (error) {
    console.error('Unexpected error in populateUserLists:', error);
    user.listMap = new Map();
  }
}

export async function populateFoldersListIDs(folder: Folder) {
  const { data, error } = await supabase.from('folderlists').select('listID').eq('folderID', folder.id);
  if (error) {
    throw error;
  }

  folder.listsIDs = data.map((list) => list.listID);
}

export async function populateFolders(user: User) {
  try {
    const { data, error } = await supabase.from('folders').select('*').eq('ownerID', user.id).is('parentFolderID', null);
    if (error) {
      console.error('Error fetching root folders:', error);
      user.rootFolders = [];
      return;
    }

    const folders = data.map((folder) => new Folder(folder.id, folder.ownerID, folder.parentFolderID, folder.name, folder.createdAt, folder.updatedAt));
    user.rootFolders = folders;

    for (const folder of user.rootFolders) {
      try {
        await populateFoldersListIDs(folder);
      } catch (error) {
        console.error(`Error populating folder lists for folder ${folder.id}:`, error);
        folder.listsIDs = [];
      }
      
      try {
        await populateSubFolders(folder);
      } catch (error) {
        console.error(`Error populating subfolders for folder ${folder.id}:`, error);
        folder.subFolders = [];
      }
    }
  } catch (error) {
    console.error('Unexpected error in populateFolders:', error);
    user.rootFolders = [];
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



 // ====== SEARCH FUNCTIONS ======

 export async function getUsersBySubstring(substring: string): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').ilike('username', `%${substring}%`);
  if (error) {
    throw error;
  }
  return data.map((user) => new User(user.id, user.username, user.email, user.avatarURL, user.createdAt, user.updatedAt, user.notifsEnabled));
 }



/**
 * Search for public lists by substring in title
 * @param substring The substring to search for
 * @returns Array of List objects matching the search criteria
 */
export async function getPublicListsBySubstring(substring: string): Promise<List[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('isPublic', true)
    .ilike('title', `%${substring}%`);
  
  if (error) {
    throw error;
  }

  return data.map((list) => new List(
    list.id, 
    list.ownerID, 
    list.title, 
    list.description, 
    list.coverImageURL, 
    list.isPublic, 
    list.sortOrder, 
    new Date(list.createdAt), 
    new Date(list.updatedAt), 
    list.today, 
    list.notifyOnNew, 
    list.notifyTime ? new Date(list.notifyTime) : null, 
    list.notifyDays
  ));
}



export async function getUserListsBySubstring(userId: string, substring: string): Promise<List[]> {
  const { data, error } = await supabase.from('lists').select('*').eq('ownerID', userId).ilike('title', `%${substring}%`);
  if (error) {
    throw error;
  }
  return data.map((list) => new List(list.id, list.ownerID, list.title, list.description, list.coverImageURL, list.isPublic, list.sortOrder, list.createdAt, list.updatedAt, list.today, list.notifyOnNew, list.notifyTime, list.notifyDays));
}

/**
 * Search for items in a user's lists by substring in title or description
 * @param userId The user ID
 * @param substring The substring to search for
 * @returns Array of Item objects matching the search criteria
 */
export async function getLibraryItemsBySubstring(user: User, substring: string): Promise<Item[]> {
  // First get all lists owned by the user
  const libraryListIDs = Array.from(user.listMap.keys());
  if (!libraryListIDs.length) {
    return [];
  }

  var items: Item[] = [];

  for (const listID of libraryListIDs) {
    const { data: listItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('listID', listID)
      .or(`title.ilike.%${substring}%, content.ilike.%${substring}%`);
    
    if (itemsError) {
      throw itemsError;
    }

    listItems.forEach((item) => {
      items.push(new Item(item.id, item.listID, item.ownerID, item.title, item.content, item.imageURLs, item.orderIndex, item.createdAt, item.updatedAt));
    });
  }

  return items;
}



// ====== TODAY FUNCTIONS ======

/**
 * Get all lists marked as "today" for a user
 * @param userId The user ID
 * @returns Array of List objects marked as today
 */
export async function getTodayListsForUser(userId: string): Promise<List[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('ownerID', userId)
    .eq('today', true);
  
  if (error) {
    throw error;
  }

  return data.map((list) => new List(
    list.id, 
    list.ownerID, 
    list.title, 
    list.description, 
    list.coverImageURL, 
    list.isPublic, 
    list.sortOrder, 
    new Date(list.createdAt), 
    new Date(list.updatedAt), 
    list.today, 
    list.notifyOnNew, 
    list.notifyTime ? new Date(list.notifyTime) : null, 
    list.notifyDays
  ));
}

/**
 * Get all items in lists marked as "today" for a user
 * @param userId The user ID
 * @returns Array of Item objects from today lists
 */
export async function getTodayItemsForUser(userId: string): Promise<Item[]> {
  // First get all lists marked as today
  const todayLists = await getTodayListsForUser(userId);
  
  if (!todayLists.length) {
    return [];
  }

  // Then get all items from those lists
  const listIds = todayLists.map(list => list.id);
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .in('listID', listIds)
    .order('position', { ascending: true });
  
  if (error) {
    throw error;
  }

  return data.map((item) => new Item(
    item.id,
    item.listID,
    item.ownerID,
    item.title,
    item.content,
    item.imageURLs,
    item.orderIndex,
    new Date(item.createdAt),
    new Date(item.updatedAt)
  ));
}

/**
 * Get all items in a specific list
 * @param listId The list ID
 * @returns Array of Item objects in the list
 */
export async function getItemsInList(listId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('listID', listId)
    .order('orderIndex', { ascending: true });
  
  if (error) {
    throw error;
  }

  const items = data.map((item) => new Item(
    item.id,
    item.listID,
    item.ownerID,
    item.title,
    item.content,
    item.imageURLs,
    item.orderIndex,
    new Date(item.createdAt),
    new Date(item.updatedAt)
  ));

  return items;
}




