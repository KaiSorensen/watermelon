import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { User } from '../../classes/User';
import { List } from '../../classes/List';
import { supabase } from '../../supabase/supabase';
import ListScreen from './ListScreen';
import ListPreview from '../components/ListPreview';

interface UserScreenProps {
  user: User;
  onBack?: () => void;
}

const UserScreen: React.FC<UserScreenProps> = ({ user, onBack }) => {
  const [publicLists, setPublicLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  useEffect(() => {
    fetchPublicLists();
  }, []);

  const fetchPublicLists = async () => {
    setLoading(true);
    try {
      // Fetch all public lists for this user
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('ownerID', user.id)
        .eq('isPublic', true);
      
      if (error) {
        throw error;
      }

      const lists = data.map((list) => new List(
        list.id, 
        list.ownerID, 
        list.title, 
        list.description, 
        list.coverImageURL, 
        list.isPublic, 
        list.sortOrder, 
        new Date(list.createdAt), 
        new Date(list.updatedAt), 
        list.today, 
        list.notifyOnNew, 
        list.notifyTime ? new Date(list.notifyTime) : null, 
        list.notifyDays
      ));

      setPublicLists(lists);
    } catch (error) {
      console.error('Error fetching public lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListSelect = (list: List) => {
    setSelectedList(list);
  };

  const handleBackFromListScreen = () => {
    setSelectedList(null);
  };

  // If a list is selected, show the ListScreen
  if (selectedList) {
    return <ListScreen list={selectedList} onBack={handleBackFromListScreen} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user.avatarURL ? (
            <Image source={{ uri: user.avatarURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>{user.username}</Text>
      </View>

      {/* Public Lists Section */}
      <View style={styles.listsSection}>
        <Text style={styles.sectionTitle}>Public Lists</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
        ) : publicLists.length === 0 ? (
          <Text style={styles.emptyMessage}>No public lists found</Text>
        ) : (
          <FlatList
            data={publicLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListPreview list={item} onPress={() => handleListSelect(item)} />
            )}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#888',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
    fontSize: 16,
  },
});

export default UserScreen; 