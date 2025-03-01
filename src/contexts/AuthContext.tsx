import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Account } from '../structs/types';
import { subscribeToAuthChanges } from '../supabase/authService';

interface AuthContextType {
  currentUser: Account | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth subscription');
    const subscription = subscribeToAuthChanges((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setCurrentUser(user);
      setLoading(false);
    });

    // Fix the unsubscribe call
    return () => {
      // Use type assertion to handle the subscription object
      const sub = subscription as any;
      if (typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      } else if (sub.data?.subscription?.unsubscribe) {
        sub.data.subscription.unsubscribe();
      }
    };
  }, []);

  console.log('Auth state:', { currentUser, loading });

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 