This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# OfTheDay App

## Global User Object

This app uses a global User object that is accessible throughout the application via React Context. The User object contains all the user's data, including folders and lists, and is automatically populated when the user logs in.

### How to Access the User Object

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

### User Object Structure

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

### Authentication Context

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

### Data Population

When a user logs in, the following happens automatically:

1. Basic user data is loaded from the authentication service
2. Lists are populated using `populateUserLists`
3. Root folders are populated using `populateFolders`
4. Subfolders are populated recursively
5. List IDs are populated for each folder

This ensures that the User object has all the necessary data for the application to function properly.
