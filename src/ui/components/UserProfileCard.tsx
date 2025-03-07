import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useUser } from '../../hooks/useUser';

/**
 * A component that displays the user's profile information
 * and demonstrates how to use the global User object
 */
export const UserProfileCard: React.FC = () => {
  const { 
    user, 
    isLoading, 
    isLoggedIn,
    getTodayLists,
    getRootFolders
  } = useUser();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedInText}>Please log in to view your profile</Text>
      </View>
    );
  }

  // Get data from the global User object
  const todayLists = getTodayLists();
  const rootFolders = getRootFolders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user?.avatarURL ? (
          <Image source={{ uri: user.avatarURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayLists.length}</Text>
          <Text style={styles.statLabel}>Today Lists</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rootFolders.length}</Text>
          <Text style={styles.statLabel}>Folders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.listMap.size || 0}</Text>
          <Text style={styles.statLabel}>Total Lists</Text>
        </View>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <View style={styles.settingItem}>
          <Text>Notifications</Text>
          <Text style={user?.notifsEnabled ? styles.enabled : styles.disabled}>
            {user?.notifsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
        <View style={styles.settingItem}>
          <Text>Account Created</Text>
          <Text>{user?.createdAt.toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    padding: 20,
  },
  notLoggedInText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingsContainer: {
    marginTop: 8,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  enabled: {
    color: 'green',
  },
  disabled: {
    color: 'red',
  },
}); 