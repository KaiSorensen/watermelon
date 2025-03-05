# Global User Object

This document explains how to use the global User object in the OfTheDay app.

## Overview

The app uses a global User object that is accessible throughout the application via React Context. The User object contains all the user's data, including folders and lists, and is automatically populated when the user logs in.

## How to Access the User Object

The easiest way to access the User object is through the `useUser` hook:

```typescript
import { useUser } from '../hooks/useUser';

function MyComponent() {
  const { 
    user,              // The User object
    isLoading,         // Boolean indicating if user data is loading
    isLoggedIn,        // Boolean indicating if user is logged in
    refreshUserData,   // Function to refresh user data
    getTodayLists,     // Function to get lists marked as "today"
    getRootFolders,    // Function to get root folders
    getList,           // Function to get a specific list by ID
    getRootFolder,     // Function to get a specific root folder by ID
    saveUser           // Function to save user changes
  } = useUser();

  // Example usage
  const todayLists = getTodayLists();
  const rootFolders = getRootFolders();
  
  // Access a specific list
  const myList = getList('list-id');
  
  // Save user changes
  const updateUsername = async () => {
    if (user) {
      user.username = 'New Username';
      await saveUser();
    }
  };
  
  // Refresh user data (e.g., after creating a new list)
  const handleRefresh = async () => {
    await refreshUserData();
  };
}
```

## User Object Structure

The User object has the following structure:

```typescript
class User {
  // Properties
  id: string;                  // User ID
  username: string;            // Username
  email: string;               // Email
  avatarURL: string | null;    // Avatar URL
  createdAt: Date;             // Creation date
  updatedAt: Date;             // Last update date
  notifsEnabled: boolean;      // Notifications enabled flag
  rootFolders: Folder[];       // Root folders
  listMap: Map<string, List>;  // Map of all lists

  // Methods
  async save(): Promise<void>;           // Save changes to database
  async refresh(): Promise<void>;        // Refresh data from database
  addRootFolder(folder: Folder): void;   // Add a root folder
  removeRootFolder(folder: Folder): void; // Remove a root folder
  addList(list: List): void;             // Add a list
  removeList(list: List): void;          // Remove a list
  getList(listId: string): List | undefined; // Get a list by ID
  getRootFolder(folderId: string): Folder | undefined; // Get a root folder by ID
  getTodayLists(): List[];               // Get lists marked as "today"
}
```

## Authentication Context

The User object is managed by the AuthContext, which handles authentication and user data loading:

```typescript
import { useAuth } from '../contexts/UserContext';

function MyComponent() {
  const { currentUser, loading, refreshUserData } = useAuth();
  
  // Use currentUser directly if needed
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    return <LoginScreen />;
  }
  
  return <UserDashboard user={currentUser} />;
}
```

## Data Population

When a user logs in, the following happens automatically:

1. Basic user data is loaded from the authentication service
2. Lists are populated using `populateUserLists`
3. Root folders are populated using `populateFolders`
4. Subfolders are populated recursively
5. List IDs are populated for each folder

This ensures that the User object has all the necessary data for the application to function properly.

## Common Use Cases

### Creating a New List

```typescript
import { useUser } from '../hooks/useUser';
import { List } from '../classes/List';
import { storeNewList } from '../supabase/databaseService';

function CreateListComponent() {
  const { user, refreshUserData } = useUser();
  
  const createNewList = async (title: string, description: string) => {
    if (!user) return;
    
    // Create a new list
    const newList = new List(
      generateUUID(), // Generate a unique ID
      user.id,        // Owner ID
      title,
      description,
      null,           // No cover image
      false,          // Not public
      "date-first",   // Default sort order
      new Date(),     // Created now
      new Date(),     // Updated now
      false,          // Not today
      false,          // No notifications
      null,           // No notification time
      null            // No notification days
    );
    
    // Save to database
    await storeNewList(newList);
    
    // Refresh user data to update the global state
    await refreshUserData();
  };
  
  return (
    // Component UI
  );
}
```

### Updating User Settings

```typescript
import { useUser } from '../hooks/useUser';

function SettingsComponent() {
  const { user, saveUser } = useUser();
  
  const updateSettings = async (newUsername: string, enableNotifs: boolean) => {
    if (!user) return;
    
    // Update user properties
    user.username = newUsername;
    user.notifsEnabled = enableNotifs;
    
    // Save changes to database
    await saveUser();
  };
  
  return (
    // Component UI
  );
}
```

### Working with Today Lists

```typescript
import { useUser } from '../hooks/useUser';

function TodayScreen() {
  const { getTodayLists } = useUser();
  
  // Get all lists marked as "today"
  const todayLists = getTodayLists();
  
  return (
    <View>
      {todayLists.map(list => (
        <ListItem key={list.id} title={list.title} />
      ))}
    </View>
  );
}
```

## Best Practices

1. **Always check if user exists**: Before accessing user properties, check if the user is logged in.
2. **Use the helper methods**: Use the methods provided by the `useUser` hook instead of directly accessing the user object when possible.
3. **Refresh after changes**: Call `refreshUserData()` after making changes to the database that affect the user's data.
4. **Handle loading state**: Always handle the loading state to provide a good user experience.
5. **Minimize state duplication**: Use the global User object instead of duplicating user data in component state. 