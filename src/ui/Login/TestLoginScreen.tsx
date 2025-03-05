import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/UserContext';
import { logout } from '../../supabase/authService';
import { retrieveUser } from '../../supabase/databaseService';

const HomeScreen = () => {
  const { currentUser } = useAuth();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      if (!currentUser) return;
      
      try {
        setDbStatus('checking');
        console.log('HomeScreen: Testing database connection for user:', currentUser.id);
        
        // Test reading the user document using our retrieveUser function
        const userData = await retrieveUser(currentUser.id);
        
        if (userData) {
          console.log('HomeScreen: Successfully read user data:', userData);
          setDbStatus('connected');
        } else {
          console.log('HomeScreen: User data not found');
          setDbStatus('error');
        }
      } catch (error) {
        console.error('HomeScreen: Database test failed:', error);
        setDbStatus('error');
      }
    };
    
    checkDatabaseConnection();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      // Auth state listener will handle navigation
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {currentUser?.username || 'User'}!</Text>
      <Text style={styles.email}>{currentUser?.email}</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Database Status:</Text>
        {dbStatus === 'checking' ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.statusText}>Checking connection...</Text>
          </View>
        ) : dbStatus === 'connected' ? (
          <Text style={[styles.statusText, { color: '#4CAF50' }]}>Connected</Text>
        ) : (
          <Text style={[styles.statusText, { color: '#F44336' }]}>Error connecting</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 