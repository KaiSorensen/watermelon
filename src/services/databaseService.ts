import { User, Folder, List, ListItem, Library } from '../data/types';
import { supabase } from '../supabase';

// ==================== USER FUNCTIONS ====================

/**
 * Updates a user's profile information
 */
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Updates user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: User['preferences']
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// ==================== FOLDER FUNCTIONS ====================

/**
 * Creates a new folder
 */
export const createFolder = async (
  userId: string,
  folderData: Omit<Folder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Folder> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('folders')
      .insert([
        {
          user_id: userId,
          parent_folder_id: folderData.parentFolderId,
          name: folderData.name,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      userId,
      parentFolderId: data.parent_folder_id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      folders: [],
      lists: []
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Gets all folders for a user
 */
export const getUserFolders = async (userId: string): Promise<Folder[]> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    
    const folders: Folder[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      parentFolderId: item.parent_folder_id || null,
      name: item.name,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      folders: [],
      lists: []
    }));
    
    return folders;
  } catch (error) {
    console.error('Error getting user folders:', error);
    throw error;
  }
};

/**
 * Gets a specific folder by ID
 */
export const getFolder = async (folderId: string): Promise<Folder | null> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      parentFolderId: data.parent_folder_id || null,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      folders: [],
      lists: []
    };
  } catch (error) {
    console.error('Error getting folder:', error);
    throw error;
  }
};

/**
 * Updates a folder
 */
export const updateFolder = async (
  folderId: string,
  updates: Partial<Omit<Folder, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name) updateData.name = updates.name;
    if (updates.parentFolderId !== undefined) updateData.parent_folder_id = updates.parentFolderId;
    
    const { error } = await supabase
      .from('folders')
      .update(updateData)
      .eq('id', folderId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

/**
 * Deletes a folder
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    // First, update all lists to remove folder reference
    const { error: updateError } = await supabase
      .from('lists')
      .update({ parent_folder_id: null })
      .eq('parent_folder_id', folderId);
    
    if (updateError) throw updateError;
    
    // Then delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// ==================== LIST FUNCTIONS ====================

/**
 * Creates a new list
 */
export const createList = async (
  userId: string,
  listData: Omit<List, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<List> => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lists')
      .insert([
        {
          user_id: userId,
          parent_folder_id: listData.parentFolderId,
          name: listData.name,
          description: listData.description,
          cover_image_url: listData.coverImageUrl,
          is_public: listData.isPublic,
          download_count: listData.downloadCount || 0,
          settings: listData.settings,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      userId,
      parentFolderId: data.parent_folder_id,
      name: data.name,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      isPublic: data.is_public,
      downloadCount: data.download_count,
      items: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      settings: data.settings
    };
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

/**
 * Gets all lists for a user
 */
export const getUserLists = async (userId: string): Promise<List[]> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    
    const lists: List[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      parentFolderId: item.parent_folder_id || null,
      name: item.name,
      description: item.description,
      coverImageUrl: item.cover_image_url,
      isPublic: item.is_public,
      downloadCount: item.download_count || 0,
      items: [],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      settings: item.settings || {
        showInToday: false,
        notifyOnNew: false
      }
    }));
    
    return lists;
  } catch (error) {
    console.error('Error getting user lists:', error);
    throw error;
  }
};

/**
 * Gets lists in a specific folder
 */
export const getListsInFolder = async (folderId: string): Promise<List[]> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('parent_folder_id', folderId)
      .order('name');
    
    if (error) throw error;
    
    const lists: List[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      parentFolderId: item.parent_folder_id,
      name: item.name,
      description: item.description,
      coverImageUrl: item.cover_image_url,
      isPublic: item.is_public,
      downloadCount: item.download_count || 0,
      items: [],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      settings: item.settings || {
        showInToday: false,
        notifyOnNew: false
      }
    }));
    
    return lists;
  } catch (error) {
    console.error('Error getting lists in folder:', error);
    throw error;
  }
};

/**
 * Gets a specific list by ID
 */
export const getList = async (listId: string): Promise<List | null> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      parentFolderId: data.parent_folder_id || null,
      name: data.name,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      isPublic: data.is_public,
      downloadCount: data.download_count || 0,
      items: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      settings: data.settings || {
        showInToday: false,
        notifyOnNew: false
      }
    };
  } catch (error) {
    console.error('Error getting list:', error);
    throw error;
  }
};

/**
 * Updates a list
 */
export const updateList = async (
  listId: string,
  updates: Partial<Omit<List, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.parentFolderId !== undefined) updateData.parent_folder_id = updates.parentFolderId;
    if (updates.coverImageUrl !== undefined) updateData.cover_image_url = updates.coverImageUrl;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.settings !== undefined) updateData.settings = updates.settings;
    
    const { error } = await supabase
      .from('lists')
      .update(updateData)
      .eq('id', listId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

/**
 * Deletes a list
 */
export const deleteList = async (listId: string): Promise<void> => {
  try {
    // First, delete all items in this list
    const { error: deleteItemsError } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId);
    
    if (deleteItemsError) throw deleteItemsError;
    
    // Then delete the list
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

/**
 * Search for public lists
 */
export const searchPublicLists = async (
  searchTerm: string,
  lastId?: string,
  resultsPerPage: number = 20
): Promise<{ lists: List[], lastDoc: string | null }> => {
  try {
    let query = supabase
      .from('lists')
      .select('*')
      .eq('is_public', true)
      .order('download_count', { ascending: false })
      .limit(resultsPerPage);
    
    if (lastId) {
      // In Supabase, we need to use a different approach for pagination
      // We'll get the download_count of the last item and use it for filtering
      const { data: lastItem } = await supabase
        .from('lists')
        .select('download_count')
        .eq('id', lastId)
        .single();
      
      if (lastItem) {
        query = query.lt('download_count', lastItem.download_count);
      }
    }
    
    // Add search term filter if provided
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const lists: List[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      description: item.description,
      items: [],
      isPublic: item.is_public,
      downloadCount: item.download_count || 0,
      parentFolderId: item.parent_folder_id || null,
      coverImageUrl: item.cover_image_url,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      settings: item.settings || {
        showInToday: false,
        notifyOnNew: false
      }
    }));
    
    // Get the ID of the last item for pagination
    const lastDoc = data.length > 0 ? data[data.length - 1].id : null;
    
    return { lists, lastDoc };
  } catch (error) {
    console.error('Error searching public lists:', error);
    throw error;
  }
};

// ==================== LIST ITEM FUNCTIONS ====================

/**
 * Creates a new list item
 */
export const createListItem = async (
  userId: string,
  listId: string,
  itemData: Omit<ListItem, 'id' | 'userId' | 'listId' | 'createdAt' | 'updatedAt'>
): Promise<ListItem> => {
  try {
    // Get the current count of items to determine orderIndex if not provided
    if (itemData.orderIndex === undefined) {
      const { count, error: countError } = await supabase
        .from('list_items')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId);
      
      if (countError) throw countError;
      itemData.orderIndex = count || 0;
    }
    
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('list_items')
      .insert([
        {
          user_id: userId,
          list_id: listId,
          title: itemData.title,
          content: itemData.content,
          order_index: itemData.orderIndex,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      userId,
      listId,
      title: data.title,
      content: data.content,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating list item:', error);
    throw error;
  }
};

/**
 * Gets all items in a list
 */
export const getListItems = async (listId: string): Promise<ListItem[]> => {
  try {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('order_index');
    
    if (error) throw error;
    
    const items: ListItem[] = data.map(item => ({
      id: item.id,
      listId: item.list_id,
      userId: item.user_id,
      title: item.title,
      content: item.content,
      orderIndex: item.order_index,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
    
    return items;
  } catch (error) {
    console.error('Error getting list items:', error);
    throw error;
  }
};

/**
 * Gets a specific list item
 */
export const getListItem = async (itemId: string): Promise<ListItem | null> => {
  try {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    return {
      id: data.id,
      listId: data.list_id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      orderIndex: data.order_index,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error getting list item:', error);
    throw error;
  }
};

/**
 * Updates a list item
 */
export const updateListItem = async (
  itemId: string,
  updates: Partial<Omit<ListItem, 'id' | 'userId' | 'listId' | 'createdAt'>>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
    
    const { error } = await supabase
      .from('list_items')
      .update(updateData)
      .eq('id', itemId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

/**
 * Deletes a list item
 */
export const deleteListItem = async (itemId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting list item:', error);
    throw error;
  }
};

/**
 * Reorders list items
 */
export const reorderListItems = async (
  listId: string,
  itemOrder: { id: string, orderIndex: number }[]
): Promise<void> => {
  try {
    // Supabase doesn't support batch operations like Firebase,
    // so we need to update each item individually
    const updatePromises = itemOrder.map(item => {
      return supabase
        .from('list_items')
        .update({ 
          order_index: item.orderIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error reordering list items:', error);
    throw error;
  }
};

// ==================== TODAY FEED FUNCTIONS ====================

/**
 * Gets a random item from each list configured for the today feed
 */
export const getTodayFeedItems = async (userId: string): Promise<ListItem[]> => {
  try {
    // Get all lists for the user
    const userLists = await getUserLists(userId);
    
    // For each list, get one random item
    const todayItems: ListItem[] = [];
    
    for (const list of userLists) {
      const { data, error } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', list.id);
      
      if (error) throw error;
      
      if (data.length > 0) {
        // Get a random item from this list
        const randomIndex = Math.floor(Math.random() * data.length);
        const item = data[randomIndex];
        
        todayItems.push({
          id: item.id,
          listId: item.list_id,
          userId: item.user_id,
          title: item.title,
          content: item.content,
          orderIndex: item.order_index,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        });
      }
    }
    
    return todayItems;
  } catch (error) {
    console.error('Error getting today feed items:', error);
    throw error;
  }
};

// Add this function to fetch user's library
export const fetchUserLibrary = async (userId: string): Promise<Library> => {
  try {
    // First check if the user has a library
    const { data, error } = await supabase
      .from('libraries')
      .select('data')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') throw error;
      
      // If no library exists, create one with sample data
      const sampleData = require('../data/sampleData.json');
      
      // Add userId to all folders and lists in the sample data
      const processedData = addUserIdToSampleData(sampleData, userId);
      
      const { error: insertError } = await supabase
        .from('libraries')
        .insert([
          {
            user_id: userId,
            data: processedData
          }
        ]);
      
      if (insertError) throw insertError;
      
      return processedData as Library;
    }
    
    return data.data as Library;
  } catch (error) {
    console.error('Error fetching library:', error);
    // Return empty library as fallback
    return { rootFolders: [] };
  }
};

// Helper function to add userId to all folders and lists in sample data
const addUserIdToSampleData = (sampleData: any, userId: string) => {
  const processedData = { ...sampleData };
  
  const processFolders = (folders: any[]) => {
    return folders.map(folder => {
      // Add userId to folder
      folder.userId = userId;
      
      // Process nested folders
      if (folder.folders && folder.folders.length > 0) {
        folder.folders = processFolders(folder.folders);
      }
      
      // Process lists in this folder
      if (folder.lists && folder.lists.length > 0) {
        folder.lists = folder.lists.map((list: any) => {
          list.userId = userId;
          list.downloadCount = 0;
          list.isPublic = false;
          
          // Process items in this list
          if (list.items && list.items.length > 0) {
            list.items = list.items.map((item: any, index: number) => {
              item.userId = userId;
              item.listId = list.id;
              item.orderIndex = index;
              return item;
            });
          }
          
          return list;
        });
      }
      
      return folder;
    });
  };
  
  if (processedData.rootFolders && processedData.rootFolders.length > 0) {
    processedData.rootFolders = processFolders(processedData.rootFolders);
  }
  
  return processedData;
};

// Function to copy a public list to user's library
export const copyPublicList = async (
  listId: string,
  targetFolderId: string | null,
  userId: string
): Promise<List> => {
  try {
    // Get the source list
    const { data: sourceList, error: sourceError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId)
      .single();
    
    if (sourceError) throw sourceError;
    
    // Increment download count on the original list
    const { error: updateError } = await supabase
      .from('lists')
      .update({ download_count: (sourceList.download_count || 0) + 1 })
      .eq('id', listId);
    
    if (updateError) throw updateError;
    
    // Create a new list in the user's library
    const now = new Date().toISOString();
    const { data: newList, error: insertError } = await supabase
      .from('lists')
      .insert([
        {
          name: sourceList.name,
          description: sourceList.description,
          is_public: false, // Default to private for copied lists
          download_count: 0,
          user_id: userId,
          parent_folder_id: targetFolderId,
          cover_image_url: sourceList.cover_image_url,
          created_at: now,
          updated_at: now,
          settings: sourceList.settings || {
            showInToday: false,
            notifyOnNew: false
          }
        }
      ])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // Get items from the source list
    const { data: sourceItems, error: itemsError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('order_index');
    
    if (itemsError) throw itemsError;
    
    // Copy items to the new list
    if (sourceItems.length > 0) {
      const newItems = sourceItems.map(item => ({
        content: item.content,
        title: item.title,
        list_id: newList.id,
        user_id: userId,
        order_index: item.order_index,
        created_at: now,
        updated_at: now
      }));
      
      const { error: insertItemsError } = await supabase
        .from('list_items')
        .insert(newItems);
      
      if (insertItemsError) throw insertItemsError;
    }
    
    return {
      id: newList.id,
      userId: newList.user_id,
      parentFolderId: newList.parent_folder_id,
      name: newList.name,
      description: newList.description,
      coverImageUrl: newList.cover_image_url,
      isPublic: newList.is_public,
      downloadCount: newList.download_count,
      items: [],
      createdAt: new Date(newList.created_at),
      updatedAt: new Date(newList.updated_at),
      settings: newList.settings
    };
  } catch (error) {
    console.error('Error copying public list:', error);
    throw error;
  }
};

// Function to update a folder's position (for drag and drop)
export const updateFolderPosition = async (
  userId: string,
  folderId: string,
  parentFolderId: string | null
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('folders')
      .update({ 
        parent_folder_id: parentFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log(`Moved folder ${folderId} to parent ${parentFolderId}`);
  } catch (error) {
    console.error('Error updating folder position:', error);
    throw error;
  }
};

// Function to update a list's position (for drag and drop)
export const updateListPosition = async (
  userId: string,
  listId: string,
  parentFolderId: string | null
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('lists')
      .update({ 
        parent_folder_id: parentFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log(`Moving list ${listId} to folder ${parentFolderId}`);
  } catch (error) {
    console.error('Error updating list position:', error);
    throw error;
  }
}; 