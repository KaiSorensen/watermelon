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
  Platform
} from 'react-native';
import { List } from '../../classes/List';
import { Item } from '../../classes/Item';
import { getItemsInList } from '../../supabase/databaseService';
import ListImage from '../components/ListImage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/UserContext';
import ItemScreen from './ItemScreen';

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
  
  // Local state for list properties that can be modified
  const [isToday, setIsToday] = useState(list.today || false);
  const [isPublic, setIsPublic] = useState(list.isPublic || false);
  const [notifyOnNew, setNotifyOnNew] = useState(list.notifyOnNew || false);
  const [sortOrder, setSortOrder] = useState<SortOrderType>(list.sortOrder as SortOrderType || "date-first");
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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

  // Fetch items when component mounts or list changes
  useEffect(() => {
    fetchItems();
  }, [list.id]);

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

  // Render an item row
  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.itemRow}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <Text style={styles.itemPreview} numberOfLines={2}>
          {stripHtml(item.content)}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color="#aaa" />
    </TouchableOpacity>
  );

  // Calculate header height based on screen dimensions
  const { width, height } = Dimensions.get('window');
  const headerHeight = Math.min(height * 0.4, 300);

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
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        {/* List header with image and details */}
        <View style={[styles.listHeader, { height: headerHeight }]}>
          <View style={styles.imageContainer}>
            <ListImage 
              imageUrl={list.coverImageURL} 
              size="large" 
              style={styles.listImage}
            />
          </View>
          
          <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{list.title}</Text>
            {list.description && (
              <Text style={styles.listDescription}>{list.description}</Text>
            )}
            <Text style={styles.listMeta}>
              {currentUser?.id === list.ownerID ? 'Your list' : 'Shared list'} • {items.length} items
            </Text>
          </View>
        </View>
        
        {/* Controls section */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Today</Text>
            <Switch
              value={isToday}
              onValueChange={handleTodayToggle}
              trackColor={{ false: '#d0d0d0', true: '#81b0ff' }}
              thumbColor={isToday ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Public</Text>
            <Switch
              value={isPublic}
              onValueChange={handlePublicToggle}
              trackColor={{ false: '#d0d0d0', true: '#81b0ff' }}
              thumbColor={isPublic ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Notifications</Text>
            <Switch
              value={notifyOnNew}
              onValueChange={handleNotifyToggle}
              trackColor={{ false: '#d0d0d0', true: '#81b0ff' }}
              thumbColor={notifyOnNew ? '#3498db' : '#f4f3f4'}
            />
          </View>
          
          <SortOrderDropdown
            value={sortOrder}
            onChange={handleSortOrderChange}
            isOpen={isSortDropdownOpen}
            toggleOpen={() => setSortDropdownOpen(!isSortDropdownOpen)}
          />
        </View>
        
        {/* Items list */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Items</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
          ) : items.length > 0 ? (
            items.map((item) => (
              <React.Fragment key={item.id}>
                {renderItem({ item })}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="list-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No items in this list yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating action button to add new items */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 10,
    left: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  listHeader: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  listImage: {
    borderRadius: 8,
  },
  listInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  listDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  listMeta: {
    fontSize: 14,
    color: '#888',
  },
  controlsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginTop: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#555',
  },
  dropdownOptionTextSelected: {
    color: '#3498db',
    fontWeight: '500',
  },
  itemsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPreview: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ListScreen; 