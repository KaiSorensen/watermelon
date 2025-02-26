import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  UserCredential,
  onAuthStateChanged,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../data/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
}

// Create a new user with email and password
export const registerWithEmail = async (email: string, password: string, username: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document in Firestore
    await createUserDocument(userCredential.user.uid, { email, username });
    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Sign in with Google
export const loginWithGoogle = async (): Promise<UserData> => {
  try {
    console.log('Starting Google Sign-In process');
    
    const googleConfig = {
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    };
    console.log('GoogleSignin configuration:', googleConfig);
    
    GoogleSignin.configure(googleConfig);
    
    // Check Play Services (for Android, but good to check)
    try {
      const hasPlayServices = await GoogleSignin.hasPlayServices();
      console.log('Has Play Services:', hasPlayServices);
    } catch (playServicesError) {
      console.error('Play Services check error:', playServicesError);
    }
    
    // Check if user is already signed in with Google
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        console.log('User is already signed in with Google, signing out first');
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      // Continue with sign-in process even if this check fails
    }
    
    console.log('Requesting Google Sign-In');
    // Add error handling around the sign-in process
    try {
      const userInfo = (await GoogleSignin.signIn());
      console.log('Google Sign-In successful, user info:', userInfo);
      
      // Access the ID token from the correct property
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign In');
      }
      
      // Create Firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);
      console.log('Created Firebase credential from Google token');
      
      // Sign in to Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);
      console.log('Firebase sign-in successful with Google credential');

      // Check if user document exists, if not create it
      const userExists = await checkUserExists(userCredential.user.uid);
      if (!userExists) {
        const { displayName, email, photoURL } = userCredential.user;
        await createUserDocument(userCredential.user.uid, {
          username: displayName || email?.split('@')[0] || 'User',
          email: email || '',
          avatarUrl: photoURL || undefined
        });
      }

      if (userCredential.user) {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // New user, create profile
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            username: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
            avatarUrl: userCredential.user.photoURL || undefined,
            createdAt: serverTimestamp(),
          });
          
          // Add sample data for new users
          await createDefaultLibraryForNewUser(userCredential.user.uid);
        }
      }

      return {
        uid: userCredential.user?.uid || '',
        email: userCredential.user?.email || '',
        displayName: userCredential.user?.displayName || '',
        photoURL: userCredential.user?.photoURL || '',
        username: userCredential.user?.displayName || userCredential.user?.email?.split('@')[0] || 'User'
      };
    } catch (signInError) {
      console.error('Error during Google Sign-In process:', signInError);
      throw signInError;
    }
  } catch (error) {
    console.error('Detailed error in Google Sign-In:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Check if user document exists in Firestore
export const checkUserExists = async (userId: string): Promise<boolean> => {
  console.log(`Checking if user exists in Firestore: ${userId}`);
  try {
    const userDocRef = doc(db, 'users', userId);
    console.log(`Getting document reference for user: ${userId}`);
    const userDoc = await getDoc(userDocRef);
    const exists = userDoc.exists();
    console.log(`User document exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};

// Create user document in Firestore
export const createUserDocument = async (
  userId: string,
  userData: { email: string; username: string; avatarUrl?: string }
): Promise<boolean> => {
  console.log('Creating user document for:', userId, userData);
  
  // Convert undefined avatarUrl to null or remove it from the object
  const sanitizedUserData = {
    ...userData,
    // Either set to null
    avatarUrl: userData.avatarUrl || null,
    // Or use this approach to remove the field if undefined
    // ...(userData.avatarUrl ? { avatarUrl: userData.avatarUrl } : {})
  };
  
  try {
    await setDoc(doc(db, 'users', userId), sanitizedUserData);
    console.log('User document created successfully');
    return true;
  } catch (error) {
    console.log('Error creating user document:', error);
    throw error;
  }
};

// Get user data from Firestore with offline handling
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<User, 'uid'>;
      return {
        uid: userId,
        ...userData,
        createdAt: userData.createdAt instanceof Date
          ? userData.createdAt
          : (userData.createdAt as any)?.toDate?.() ? new Date((userData.createdAt as any).toDate()) : new Date(),
        updatedAt: userData.updatedAt instanceof Date
          ? userData.updatedAt
          : (userData.updatedAt as any)?.toDate?.() ? new Date((userData.updatedAt as any).toDate()) : new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    // Return a basic user object when offline instead of null
    if (error instanceof Error && error.message.includes('offline')) {
      return {
        uid: userId,
        username: 'Offline User',
        email: 'offline@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'light',
          notificationsEnabled: true
        }
      };
    }
    return null;
  }
};

// Auth state listener with better error handling and forced navigation
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        console.log('Firebase user authenticated:', firebaseUser.uid);
        
        // Check if user document exists in Firestore
        let userExists = false;
        try {
          userExists = await checkUserExists(firebaseUser.uid);
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }
        
        // If user doesn't exist in Firestore, create a new document
        if (!userExists) {
          console.log('Creating new user document for:', firebaseUser.uid);
          try {
            const { displayName, email, photoURL } = firebaseUser;
            await createUserDocument(firebaseUser.uid, {
              username: displayName || email?.split('@')[0] || 'User',
              email: email || '',
              avatarUrl: photoURL || undefined
            });
            console.log('User document created successfully');
          } catch (error) {
            console.error('Error creating user document:', error);
          }
        }
        
        // Create a basic user object immediately to ensure navigation happens
        const basicUser: User = {
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || 'unknown@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            theme: 'light',
            notificationsEnabled: true
          }
        };
        
        // Call the callback immediately with the basic user
        callback(basicUser);
        
        // Then try to get the full user data in the background
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            console.log('User data retrieved successfully, updating');
            callback(userData);
          }
        } catch (error) {
          console.error('Error getting full user data:', error);
          // We already called callback with basicUser, so no need to do it again
        }
      } else {
        console.log('No Firebase user, setting auth state to null');
        callback(null);
      }
    } catch (error) {
      console.error('Critical error in auth state listener:', error);
      callback(null);
    }
  });
};

// Helper function to create default library
const createDefaultLibraryForNewUser = async (userId: string) => {
  try {
    const sampleData = require('../data/sampleData.json');
    await setDoc(doc(db, 'users', userId, 'library', 'data'), sampleData);
  } catch (error) {
    console.error('Error creating default library:', error);
  }
}; 