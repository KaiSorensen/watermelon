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
export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    // Make sure auth is properly initialized before using signInWithCredential
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    // For React Native, we need to use GoogleSignin and signInWithCredential
    // This is a placeholder - you'll need to install and configure @react-native-google-signin/google-signin
    // throw new Error('Google Sign-In not properly configured for React Native. Please install @react-native-google-signin/google-signin');

    // The proper implementation would look something like this:

    // Configure GoogleSignin
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });

    // Sign in with Google
    const { idToken } = (await GoogleSignin.signIn()).data ?? { idToken: null };
    if (!idToken) {
      throw new Error('No ID token returned from Google Sign In');
    }
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

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

    return userCredential;

  } catch (error) {
    console.error('Error signing in with Google:', error);
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
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists();
};

// Create user document in Firestore
export const createUserDocument = async (
  userId: string,
  userData: { email: string; username: string; avatarUrl?: string }
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);

  // Create new user object
  const newUser: Omit<User, 'id'> = {
    username: userData.username,
    email: userData.email,
    avatarUrl: userData.avatarUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'light',
      notificationsEnabled: true
    }
  };

  await setDoc(userDocRef, {
    ...newUser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Get user data from Firestore with offline handling
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<User, 'id'>;
      return {
        id: userId,
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
        id: userId,
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
        
        // Create a basic user object immediately to ensure navigation happens
        const basicUser: User = {
          id: firebaseUser.uid,
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
          if (userData && userData.id !== basicUser.id) {
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