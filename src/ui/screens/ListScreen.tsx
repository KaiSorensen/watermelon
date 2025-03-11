import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { List } from '../../classes/List';
import { Item } from '../../classes/Item';
import { User } from '../../classes/User';
import { getItemsInList, retrieveUser } from '../../supabase/databaseService';
import ListImage from '../components/ListImage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/UserContext';
import ItemScreen from './ItemScreen';
import UserScreen from './UserScreen';

// Helper function to strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, '');
};

// Define type for sort order
type SortOrderType = "date-first" | "date-last" | "alphabetical" | "manual";

// Define props interface for the dropdown component
interface SortOrderDropdownProps {
  value: SortOrderType;
  onChange: (value: SortOrderType) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

// Dropdown component for sort order
const SortOrderDropdown: React.FC<SortOrderDropdownProps> = ({ value, onChange, isOpen, toggleOpen }) => {
  const options: SortOrderType[] = ["date-first", "date-last", "alphabetical", "manual"];
  
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={styles.dropdownHeader} 
        onPress={toggleOpen}
      >
        <Text style={styles.dropdownHeaderText}>Sort: {value}</Text>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#555"
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                value === option && styles.dropdownOptionSelected
              ]}
              onPress={() => {
                onChange(option);
                toggleOpen();
              }}
            >
              <Text 
                style={[
                  styles.dropdownOptionText,
                  value === option && styles.dropdownOptionTextSelected
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface ListScreenProps {
  list: List;
  onBack?: () => void;
}

const ListScreen: React.FC<ListScreenProps> = ({ list, onBack }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [listOwner, setListOwner] = useState<User | null>(null);
  const [showingUserScreen, setShowingUserScreen] = useState(false);
  
  // Local state for list properties that can be modified
  const [isToday, setIsToday] = useState(list.today || false);
  const [isPublic, setIsPublic] = useState(list.isPublic || false);
  const [notifyOnNew, setNotifyOnNew] = useState(list.notifyOnNew || false);
  const [sortOrder, setSortOrder] = useState<SortOrderType>(list.sortOrder as SortOrderType || 'date-first');
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchListOwner();
  }, []);

  // Function to fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const listItems = await getItemsInList(list.id);
      setItems(listItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListOwner = async () => {
    try {
      if (list.ownerID) {
        const ownerData = await retrieveUser(list.ownerID);
        if (ownerData) {
          setListOwner(ownerData);
        }
      }
    } catch (error) {
      console.error('Error fetching list owner:', error);
    }
  };

  // Save list changes
  const saveListChanges = async () => {
    try {
      list.today = isToday;
      list.isPublic = isPublic;
      list.notifyOnNew = notifyOnNew;
      list.sortOrder = sortOrder;
      await list.save();
    } catch (error) {
      console.error('Error saving list changes:', error);
      // Revert to original values if save fails
      setIsToday(list.today || false);
      setIsPublic(list.isPublic || false);
      setNotifyOnNew(list.notifyOnNew || false);
      setSortOrder(list.sortOrder as SortOrderType || "date-first");
    }
  };

  // Handle toggle changes
  const handleTodayToggle = (value: boolean) => {
    setIsToday(value);
    // Save changes after a short delay to avoid too many saves
    setTimeout(saveListChanges, 500);
  };

  const handlePublicToggle = (value: boolean) => {
    setIsPublic(value);
    setTimeout(saveListChanges, 500);
  };

  const handleNotifyToggle = (value: boolean) => {
    setNotifyOnNew(value);
    setTimeout(saveListChanges, 500);
  };

  const handleSortOrderChange = (value: SortOrderType) => {
    setSortOrder(value);
    setTimeout(saveListChanges, 500);
  };

  const handleViewOwnerProfile = () => {
    if (listOwner) {
      setShowingUserScreen(true);
    }
  };

  const handleBackFromUserScreen = () => {
    setShowingUserScreen(false);
  };

  // Render an item row
  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {stripHtml(item.content)}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color="#aaa" />
    </TouchableOpacity>
  );

  // Calculate header height based on screen dimensions
  const { width, height } = Dimensions.get('window');
  const headerHeight = Math.min(height * 0.4, 300);

  // If showing user screen
  if (showingUserScreen && listOwner) {
    return <UserScreen user={listOwner} onBack={handleBackFromUserScreen} />;
  }

  // If an item is selected, show the ItemScreen
  if (selectedItem) {
    return (
      <ItemScreen 
        item={selectedItem} 
        onBack={() => {
          setSelectedItem(null);
          // Refresh items list when returning from ItemScreen
          fetchItems();
        }} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button and list title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {list.title}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* List details section */}
      <View style={styles.detailsSection}>
        <View style={styles.coverImageContainer}>
          {list.coverImageURL ? (
            <Image source={{ uri: list.coverImageURL }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImagePlaceholder, { backgroundColor: '#e0e0e0' }]} />
          )}
        </View>
        
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{list.title}</Text>
          
          {/* Owner info with profile link */}
          {listOwner && (
            <TouchableOpacity 
              style={styles.ownerContainer} 
              onPress={handleViewOwnerProfile}
            >
              <View style={styles.ownerAvatarContainer}>
                {listOwner.avatarURL ? (
                  <Image source={{ uri: listOwner.avatarURL }} style={styles.ownerAvatar} />
                ) : (
                  <Text style={styles.ownerAvatarText}>
                    {listOwner.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={styles.ownerName}>
                {listOwner.username}
              </Text>
              <Icon name="chevron-forward" size={16} color="#888" />
            </TouchableOpacity>
          )}
          
          {list.description && (
            <Text style={styles.listDescription}>
              {stripHtml(list.description)}
            </Text>
          )}
        </View>
      
        {/* List controls section - only show if current user is the owner */}
        {currentUser && currentUser.id === list.ownerID && (
          <View style={styles.controlsSection}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Today</Text>
              <Switch
                value={isToday}
                onValueChange={handleTodayToggle}
                trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
                thumbColor={isToday ? '#4285F4' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Public</Text>
              <Switch
                value={isPublic}
                onValueChange={handlePublicToggle}
                trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
                thumbColor={isPublic ? '#4285F4' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Notify on new</Text>
              <Switch
                value={notifyOnNew}
                onValueChange={handleNotifyToggle}
                trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
                thumbColor={notifyOnNew ? '#4285F4' : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Sort order dropdown */}
      <SortOrderDropdown
        value={sortOrder}
        onChange={handleSortOrderChange}
        isOpen={isSortOrderOpen}
        toggleOpen={() => setIsSortOrderOpen(!isSortOrderOpen)}
      />
      
      {/* Items list */}
      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No items in this list yet</Text>
          }
        />
      )}
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
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    width: 40,
  },
  detailsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  listInfo: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  listDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  ownerAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  ownerAvatar: {
    width: '100%',
    height: '100%',
  },
  ownerAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  ownerName: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  controlsSection: {
    marginTop: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptions: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#555',
  },
  dropdownOptionTextSelected: {
    color: '#4285F4',
    fontWeight: '600',
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
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    padding: 8,
  },
});

export default ListScreen; 