import { Account } from '../structs/types';
import { supabase } from '../supabase';
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
// !! this is failing to create the user profile in Supabase, resume here
// because there are no documents, it's a SQL database, not a NoSQL database
export const registerWithEmail = async (email: string, password: string, username: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;

    // Create user profile in Supabase
    if (data.user) {
      await createUserDocument(data.user.id, { email, username });
    }

    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
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
    try {
      const userInfo = (await GoogleSignin.signIn());
      console.log('Google Sign-In successful, user info:', userInfo);
      
      // Access the ID token from the correct property
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign In');
      }
      
      // Sign in to Supabase with Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      
      if (error) throw error;
      
      console.log('Supabase sign-in successful with Google credential');

      // Check if user document exists, if not create it
      const userExists = await checkUserExists(data.user.id);
      if (!userExists) {
        const { email, user_metadata } = data.user;
        await createUserDocument(data.user.id, {
          username: user_metadata?.name || email?.split('@')[0] || 'User',
          email: email || '',
          avatarUrl: user_metadata?.avatar_url || undefined
        });
        
        // Add sample data for new users
        await createDefaultLibraryForNewUser(data.user.id);
      }

      return {
        uid: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.name || '',
        photoURL: data.user.user_metadata?.avatar_url || '',
        username: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'
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
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Check if user document exists in Supabase
export const checkUserExists = async (userId: string): Promise<boolean> => {
  console.log(`Checking if user exists in Supabase: ${userId}`);
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    const exists = !!data;
    console.log(`User document exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
};

// Create user document in Supabase
export const createUserDocument = async (
  userId: string,
  userData: { email: string; username: string; avatarUrl?: string }
): Promise<boolean> => {
  console.log('Creating user document for:', userId, userData);
  
  try {
    const { error } = await supabase
      .from('accounts')
      .insert([
        {
          id: userId,
          email: userData.email,
          username: userData.username,
          avatarURL: userData.avatarUrl || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    
    console.log('User document created successfully');
    return true;
  } catch (error) {
    console.log('Error creating user document:', error);
    throw error;
  }
};

// Get user data from Supabase with offline handling
export const getUserData = async (userId: string): Promise<Account | null> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (data) {
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        notifsEnabled: data.notifsEnabled
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
        notifsEnabled: true
      };
    }
    return null;
  }
};

// Auth state listener with better error handling and forced navigation
export const subscribeToAuthChanges = (callback: (user: Account | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      if (session?.user) {
        console.log('Supabase user authenticated:', session.user.id);
        
        // Check if user document exists in Supabase
        let userExists = false;
        try {
          userExists = await checkUserExists(session.user.id);
        } catch (error) {
          console.error('Error checking if user exists:', error);
        }
        
        // If user doesn't exist in Supabase, create a new document
        if (!userExists) {
          console.log('Creating new user document for:', session.user.id);
          try {
            const { user_metadata, email } = session.user;
            await createUserDocument(session.user.id, {
              username: user_metadata?.name || email?.split('@')[0] || 'User',
              email: email || '',
              avatarURL: user_metadata?.avatar_url || undefined
            });
            console.log('User document created successfully');
          } catch (error) {
            console.error('Error creating user document:', error);
          }
        }
        
        // Create a basic user object immediately to ensure navigation happens
        const basicUser: Account = {
          id: session.user.id,
          username: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || 'unknown@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          notifsEnabled: true
        };
        
        // Call the callback immediately with the basic user
        callback(basicUser);
        
        // Then try to get the full user data in the background
        try {
          const userData = await getUserData(session.user.id);
          if (userData) {
            console.log('User data retrieved successfully, updating');
            callback(userData);
          }
        } catch (error) {
          console.error('Error getting full user data:', error);
          // We already called callback with basicUser, so no need to do it again
        }
      } else {
        console.log('No Supabase user, setting auth state to null');
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
    const { error } = await supabase
      .from('libraries')
      .insert([
        {
          user_id: userId,
          data: sampleData
        }
      ]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating default library:', error);
  }
};