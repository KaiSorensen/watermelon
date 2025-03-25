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
import { useColors } from '../../contexts/ColorContext';
import ItemScreen from './ItemScreen';
import UserScreen from './UserScreen';
import ListSettingsModal from '../components/ListSettingsModal';

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
  colors: any;
}

// Dropdown component for sort order
const SortOrderDropdown: React.FC<SortOrderDropdownProps> = ({ value, onChange, isOpen, toggleOpen, colors }) => {
  const options: SortOrderType[] = ["date-first", "date-last", "alphabetical", "manual"];
  
  return (
    <View style={[styles.dropdownContainer, { borderColor: colors.divider }]}>
      <TouchableOpacity 
        style={[styles.dropdownHeader, { backgroundColor: colors.backgroundSecondary }]} 
        onPress={toggleOpen}
      >
        <Text style={[styles.dropdownHeaderText, { color: colors.textPrimary }]}>Sort: {value}</Text>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={colors.iconSecondary}
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                { borderBottomColor: colors.divider },
                value === option && [styles.dropdownOptionSelected, { backgroundColor: colors.backgroundTertiary }]
              ]}
              onPress={() => {
                onChange(option);
                toggleOpen();
              }}
            >
              <Text 
                style={[
                  styles.dropdownOptionText,
                  { color: colors.textSecondary },
                  value === option && [styles.dropdownOptionTextSelected, { color: colors.primary }]
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
  const { colors, isDarkMode } = useColors();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [listOwner, setListOwner] = useState<User | null>(null);
  const [showingUserScreen, setShowingUserScreen] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  
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

  // Handle settings save
  const handleSettingsSave = async (updates: Partial<List>) => {
    try {
      // Update local state immediately for UI feedback
      if ('isPublic' in updates && updates.isPublic !== undefined) setIsPublic(updates.isPublic);
      if ('today' in updates && updates.today !== undefined) setIsToday(updates.today);
      if ('notifyOnNew' in updates && updates.notifyOnNew !== undefined) setNotifyOnNew(updates.notifyOnNew);
      if ('sortOrder' in updates && updates.sortOrder !== undefined) setSortOrder(updates.sortOrder as SortOrderType);

      // Update the list object
      Object.assign(list, updates);
      
      // Save to database
      await list.save();
    } catch (error) {
      console.error('Error saving list settings:', error);
      // Revert local state if save fails
      if ('isPublic' in updates && updates.isPublic !== undefined) setIsPublic(list.isPublic);
      if ('today' in updates && updates.today !== undefined) setIsToday(list.today);
      if ('notifyOnNew' in updates && updates.notifyOnNew !== undefined) setNotifyOnNew(list.notifyOnNew);
      if ('sortOrder' in updates && updates.sortOrder !== undefined) setSortOrder(list.sortOrder as SortOrderType);
    }
  };

  // Render an item row
  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={[styles.resultItem, { 
        backgroundColor: colors.card,
        shadowColor: colors.shadow
      }]}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {stripHtml(item.content)}
        </Text>
      </View>
      <Icon name="chevron-forward" size={24} color={colors.iconSecondary} />
    </TouchableOpacity>
  );

  // Calculate header height based on screen dimensions
  const { width, height } = Dimensions.get('window');
  const headerHeight = Math.min(height * 0.4, 300);

  // If showing user screen
  if (showingUserScreen && listOwner) {
    return <UserScreen user={listOwner} onBack={() => setShowingUserScreen(false)} />;
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header with back button and list title */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
          {list.title}
        </Text>
        <TouchableOpacity 
          style={styles.headerRight} 
          onPress={() => setIsSettingsModalVisible(true)}
        >
          <Icon name="settings-outline" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
      </View>
      
      {/* List details section */}
      <View style={[styles.detailsSection, { borderBottomColor: colors.divider }]}>
        <View style={styles.coverImageContainer}>
          {list.coverImageURL ? (
            <Image source={{ uri: list.coverImageURL }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImagePlaceholder, { backgroundColor: colors.backgroundSecondary }]} />
          )}
        </View>
        
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{list.title}</Text>
          
          {/* Owner info with profile link */}
          {listOwner && (
            <TouchableOpacity 
              style={[styles.ownerContainer, { backgroundColor: colors.backgroundSecondary }]} 
              onPress={() => setShowingUserScreen(true)}
            >
              <View style={[styles.ownerAvatarContainer, { backgroundColor: colors.backgroundTertiary }]}>
                {listOwner.avatarURL ? (
                  <Image source={{ uri: listOwner.avatarURL }} style={styles.ownerAvatar} />
                ) : (
                  <Text style={[styles.ownerAvatarText, { color: colors.textTertiary }]}>
                    {listOwner.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={[styles.ownerName, { color: colors.textSecondary }]}>
                {listOwner.username}
              </Text>
              <Icon name="chevron-forward" size={16} color={colors.iconSecondary} />
            </TouchableOpacity>
          )}
          
          {list.description && (
            <Text style={[styles.listDescription, { color: colors.textSecondary }]}>
              {stripHtml(list.description)}
            </Text>
          )}
        </View>
      
        {/* List controls section - only show if current user is the owner */}
        {currentUser && currentUser.id === list.ownerID && (
          <View style={styles.controlsSection}>
            <View style={[styles.controlRow, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>Today</Text>
              <Switch
                value={isToday}
                onValueChange={(value) => {
                  setIsToday(value);
                  handleSettingsSave({ today: value });
                }}
                trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
                thumbColor={isToday ? colors.primary : colors.backgroundTertiary}
              />
            </View>
            
            <View style={[styles.controlRow, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>Public</Text>
              <Switch
                value={isPublic}
                onValueChange={(value) => {
                  setIsPublic(value);
                  handleSettingsSave({ isPublic: value });
                }}
                trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
                thumbColor={isPublic ? colors.primary : colors.backgroundTertiary}
              />
            </View>
            
            <View style={[styles.controlRow, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.controlLabel, { color: colors.textPrimary }]}>Notify on new</Text>
              <Switch
                value={notifyOnNew}
                onValueChange={(value) => {
                  setNotifyOnNew(value);
                  handleSettingsSave({ notifyOnNew: value });
                }}
                trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
                thumbColor={notifyOnNew ? colors.primary : colors.backgroundTertiary}
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Sort order dropdown */}
      <SortOrderDropdown
        value={sortOrder}
        onChange={(value) => {
          setSortOrder(value);
          handleSettingsSave({ sortOrder: value });
        }}
        isOpen={isSortOrderOpen}
        toggleOpen={() => setIsSortOrderOpen(!isSortOrderOpen)}
        colors={colors}
      />
      
      {/* Items list */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={[styles.emptyMessage, { color: colors.textTertiary }]}>No items in this list yet</Text>
          }
        />
      )}

      {/* Settings Modal */}
      <ListSettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        list={list}
        onSave={handleSettingsSave}
        isOwner={list.isOwner()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    padding: 8,
  },
  detailsSection: {
    padding: 16,
    borderBottomWidth: 1,
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
  },
  listInfo: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 6,
    borderRadius: 20,
  },
  ownerAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  ownerName: {
    fontSize: 14,
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
  },
  controlLabel: {
    fontSize: 16,
  },
  dropdownContainer: {
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dropdownHeaderText: {
    fontSize: 16,
  },
  dropdownOptions: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionSelected: {
    // Background color is set dynamically
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownOptionTextSelected: {
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
    fontSize: 16,
  },
  resultItem: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContent: {
    flex: 1,
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
  },
  actionButton: {
    padding: 8,
  },
});

export default ListScreen; 