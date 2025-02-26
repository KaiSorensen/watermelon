import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  limit,
  startAfter,
  DocumentSnapshot,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Folder, List, ListItem, Library } from '../data/types';

// ==================== USER FUNCTIONS ====================

/**
 * Updates a user's profile information
 */
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
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
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    });
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
    const folderRef = collection(db, 'folders');
    const newFolderDoc = await addDoc(folderRef, {
      ...folderData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: newFolderDoc.id,
      userId,
      ...folderData,
      createdAt: new Date(),
      updatedAt: new Date()
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
    const foldersQuery = query(
      collection(db, 'folders'),
      where('userId', '==', userId),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(foldersQuery);
    const folders: Folder[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      folders.push({
        id: doc.id,
        userId: data.userId,
        parentFolderId: data.parentFolderId || null,
        name: data.name,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        folders: [], // Add missing property
        lists: [] // Add missing property
      });
    });
    
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
    const folderRef = doc(db, 'folders', folderId);
    const folderDoc = await getDoc(folderRef);
    
    if (!folderDoc.exists()) {
      return null;
    }
    
    const data = folderDoc.data();
    return {
      id: folderDoc.id,
      userId: data.userId,
      parentFolderId: data.parentFolderId || null,
      name: data.name,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      folders: [], // Add missing property
      lists: [] // Add missing property
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
    const folderRef = doc(db, 'folders', folderId);
    await updateDoc(folderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
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
    // First, get all lists in this folder
    const listsQuery = query(
      collection(db, 'lists'),
      where('parentFolderId', '==', folderId)
    );
    const listsSnapshot = await getDocs(listsQuery);
    
    // Update all lists to remove folder reference
    const updatePromises = listsSnapshot.docs.map(doc => 
      updateDoc(doc.ref, { parentFolderId: null })
    );
    await Promise.all(updatePromises);
    
    // Then delete the folder
    const folderRef = doc(db, 'folders', folderId);
    await deleteDoc(folderRef);
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
    const listRef = collection(db, 'lists');
    const newListDoc = await addDoc(listRef, {
      ...listData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: newListDoc.id,
      userId,
      ...listData,
      createdAt: new Date(),
      updatedAt: new Date()
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
    const listsQuery = query(
      collection(db, 'lists'),
      where('userId', '==', userId),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(listsQuery);
    const lists: List[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({
        id: doc.id,
        userId: data.userId,
        parentFolderId: data.parentFolderId || null,
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        isPublic: data.isPublic,
        downloadCount: data.downloadCount || 0,
        items: [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        settings: data.settings || {
          showInToday: false,
          notifyOnNew: false
        }
      });
    });
    
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
    const listsQuery = query(
      collection(db, 'lists'),
      where('parentFolderId', '==', folderId),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(listsQuery);
    const lists: List[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      lists.push({
        id: doc.id,
        userId: data.userId,
        parentFolderId: data.parentFolderId,
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        isPublic: data.isPublic,
        downloadCount: data.downloadCount || 0,
        items: [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        settings: data.settings || {
          showInToday: false,
          notifyOnNew: false
        }
      });
    });
    
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
    const listRef = doc(db, 'lists', listId);
    const listDoc = await getDoc(listRef);
    
    if (!listDoc.exists()) {
      return null;
    }
    
    const data = listDoc.data();
    return {
      id: listDoc.id,
      userId: data.userId,
      parentFolderId: data.parentFolderId || null,
      name: data.name,
      description: data.description,
      coverImageUrl: data.coverImageUrl,
      isPublic: data.isPublic,
      downloadCount: data.downloadCount || 0,
      items: [],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
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
    const listRef = doc(db, 'lists', listId);
    await updateDoc(listRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
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
    const itemsQuery = query(
      collection(db, 'listItems'),
      where('listId', '==', listId)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    
    const deletePromises = itemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Then delete the list
    const listRef = doc(db, 'lists', listId);
    await deleteDoc(listRef);
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
  lastDoc?: DocumentSnapshot,
  resultsPerPage: number = 20
): Promise<{ lists: List[], lastDoc: DocumentSnapshot | null }> => {
  try {
    // Create a query for public lists
    let listsQuery = query(
      collection(db, 'lists'),
      where('isPublic', '==', true),
      orderBy('downloadCount', 'desc'), // Sort by popularity
      limit(resultsPerPage)
    );
    
    if (lastDoc) {
      listsQuery = query(listsQuery, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(listsQuery);
    const lists: List[] = [];
    let lastVisible: DocumentSnapshot | null = null;
    
    if (!querySnapshot.empty) {
      lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by search term if provided
        if (!searchTerm || 
            data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (data.description && data.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
          lists.push({
            id: doc.id,
            userId: data.userId,
            name: data.name,
            description: data.description,
            items: [], // We'll load items separately for efficiency
            isPublic: data.isPublic,
            downloadCount: data.downloadCount || 0,
            parentFolderId: data.parentFolderId || null,
            coverImageUrl: data.coverImageUrl,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
            settings: data.settings || {
              showInToday: false,
              notifyOnNew: false
            }
          });
        }
      });
    }
    
    return { lists, lastDoc: lastVisible };
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
      const itemsQuery = query(
        collection(db, 'listItems'),
        where('listId', '==', listId)
      );
      const querySnapshot = await getDocs(itemsQuery);
      itemData.orderIndex = querySnapshot.size;
    }
    
    const itemRef = collection(db, 'listItems');
    const newItemDoc = await addDoc(itemRef, {
      ...itemData,
      userId,
      listId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: newItemDoc.id,
      userId,
      listId,
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
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
    const itemsQuery = query(
      collection(db, 'listItems'),
      where('listId', '==', listId),
      orderBy('orderIndex')
    );
    
    const querySnapshot = await getDocs(itemsQuery);
    const items: ListItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        listId: data.listId,
        userId: data.userId,
        title: data.title,
        content: data.content,
        orderIndex: data.orderIndex,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
      });
    });
    
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
    const itemRef = doc(db, 'listItems', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      return null;
    }
    
    const data = itemDoc.data();
    return {
      id: itemDoc.id,
      listId: data.listId,
      userId: data.userId,
      title: data.title,
      content: data.content,
      orderIndex: data.orderIndex,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
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
    const itemRef = doc(db, 'listItems', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
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
    const itemRef = doc(db, 'listItems', itemId);
    await deleteDoc(itemRef);
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
    const batch = writeBatch(db);
    
    itemOrder.forEach(item => {
      const itemRef = doc(db, 'listItems', item.id);
      batch.update(itemRef, { 
        orderIndex: item.orderIndex,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error reordering list items:', error);
    throw error;
  }
};

// ==================== TODAY FEED FUNCTIONS ====================

/**
 * Gets a random item from each list configured for the today feed
 * This is a simplified implementation - you'll need to add configuration
 * for which lists should appear in the today feed and how often
 */
export const getTodayFeedItems = async (userId: string): Promise<ListItem[]> => {
  try {
    // Get all lists for the user
    const userLists = await getUserLists(userId);
    
    // For each list, get one random item
    // In a real implementation, you'd have a more sophisticated algorithm
    // based on user preferences, history, etc.
    const todayItems: ListItem[] = [];
    
    for (const list of userLists) {
      const items = await getListItems(list.id);
      if (items.length > 0) {
        // Get a random item from this list
        const randomIndex = Math.floor(Math.random() * items.length);
        todayItems.push(items[randomIndex]);
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
    const libraryDocRef = doc(db, 'users', userId, 'library', 'data');
    const libraryDoc = await getDoc(libraryDocRef);
    
    if (libraryDoc.exists()) {
      return libraryDoc.data() as Library;
    } else {
      // If no library exists, create one with sample data
      const sampleData = require('../data/sampleData.json');
      
      // Add userId to all folders and lists in the sample data
      const processedData = addUserIdToSampleData(sampleData, userId);
      
      await setDoc(libraryDocRef, processedData);
      return processedData as Library;
    }
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
    const sourceListRef = doc(db, 'lists', listId);
    const sourceListDoc = await getDoc(sourceListRef);
    
    if (!sourceListDoc.exists()) {
      throw new Error('List not found');
    }
    
    const sourceList = sourceListDoc.data();
    
    // Increment download count on the original list
    await updateDoc(sourceListRef, {
      downloadCount: (sourceList.downloadCount || 0) + 1
    });
    
    // Create a new list in the user's library
    const newListRef = collection(db, 'lists');
    const newListData = {
      name: sourceList.name,
      description: sourceList.description,
      isPublic: false, // Default to private for copied lists
      downloadCount: 0,
      userId: userId,
      parentFolderId: targetFolderId,
      coverImageUrl: sourceList.coverImageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: sourceList.settings || {
        showInToday: false,
        notifyOnNew: false
      }
    };
    
    const newListDoc = await addDoc(newListRef, newListData);
    
    // Get items from the source list
    const itemsQuery = query(
      collection(db, 'listItems'),
      where('listId', '==', listId),
      orderBy('orderIndex')
    );
    
    const itemsSnapshot = await getDocs(itemsQuery);
    
    // Copy items to the new list
    const batch = writeBatch(db);
    
    itemsSnapshot.docs.forEach((itemDoc) => {
      const itemData = itemDoc.data();
      const newItemRef = doc(collection(db, 'listItems'));
      
      batch.set(newItemRef, {
        content: itemData.content,
        title: itemData.title,
        listId: newListDoc.id,
        userId: userId,
        orderIndex: itemData.orderIndex,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    // Update the user's library structure to include this list
    // This would depend on how you're storing the library structure
    
    return {
      id: newListDoc.id,
      ...newListData,
      items: [], // Items are stored separately
      createdAt: new Date(),
      updatedAt: new Date()
    } as List;
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
) => {
  // This is a placeholder for the drag-and-drop functionality
  // Will implement the actual logic later
  console.log(`Moving folder ${folderId} to parent ${parentFolderId}`);
};

// Function to update a list's position (for drag and drop)
export const updateListPosition = async (
  userId: string,
  listId: string,
  parentFolderId: string
) => {
  // This is a placeholder for the drag-and-drop functionality
  // Will implement the actual logic later
  console.log(`Moving list ${listId} to folder ${parentFolderId}`);
}; 