import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
  getPublicListsBySubstring, 
  getUserListsBySubstring, 
  getLibraryItemsBySubstring,
  getUsersBySubstring
} from '../../supabase/databaseService';
import { List } from '../../classes/List';
import { Item } from '../../classes/Item';
import { User } from '../../classes/User';
import { useAuth } from '../../contexts/UserContext';
import { useColors } from '../../contexts/ColorContext';
import debounce from 'lodash.debounce';
import ListScreen from '../screens/ListScreen';
import ItemScreen from '../screens/ItemScreen';
import UserScreen from '../screens/UserScreen';

// Helper function to strip HTML tags for plain text display
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, '');
};

// Define filter types
type FilterType = 'library' | 'lists' | 'items' | 'users';

// Define result types for the union type
type SearchResult = {
  type: 'list' | 'item' | 'user';
  data: List | Item | User;
};

const SearchScreen = () => {
  const { currentUser } = useAuth();
  const { colors } = useColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('library');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term: string, filter: FilterType) => {
      if (term.trim().length > 0) {
        performSearch(term, filter);
      } else {
        setResults([]);
      }
    }, 300),
    [currentUser]
  );

  // Effect to trigger search when searchTerm or activeFilter changes
  useEffect(() => {
    debouncedSearch(searchTerm, activeFilter);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, activeFilter, debouncedSearch]);

  // Main search function
  const performSearch = async (term: string, filter: FilterType) => {
    if (!term.trim() || !currentUser) return;
    
    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      // Search based on the active filter
      switch (filter) {
        case 'library':
          // Search both user's lists and items
          const userLists = await getUserListsBySubstring(currentUser.id, term);
          const userItems = await getLibraryItemsBySubstring(currentUser, term);
          
          // Add lists to results
          searchResults = [
            ...userLists.map(list => ({ type: 'list' as const, data: list })),
            ...userItems.map(item => ({ type: 'item' as const, data: item }))
          ];
          
          // If we have fewer than 10 results, also search public lists and users
          if (searchResults.length < 10) {
            const publicLists = await getPublicListsBySubstring(term);
            const publicUsers = await getUsersBySubstring(term);
            
            // Add public results, but prioritize user's own content
            searchResults = [
              ...searchResults,
              ...publicLists
                .filter(list => !userLists.some(ul => ul.id === list.id))
                .map(list => ({ type: 'list' as const, data: list })),
              ...publicUsers.map(user => ({ type: 'user' as const, data: user }))
            ];
          }
          break;
          
        case 'lists':
          // Search user's lists first
          const ownLists = await getUserListsBySubstring(currentUser.id, term);
          
          // Then search public lists
          const allPublicLists = await getPublicListsBySubstring(term);
          
          // Combine results, prioritizing user's own lists
          searchResults = [
            ...ownLists.map(list => ({ type: 'list' as const, data: list })),
            ...allPublicLists
              .filter(list => !ownLists.some(ol => ol.id === list.id))
              .map(list => ({ type: 'list' as const, data: list }))
          ];
          break;
          
        case 'items':
          // Only search items in user's library
          const items = await getLibraryItemsBySubstring(currentUser, term);
          searchResults = items.map(item => ({ type: 'item' as const, data: item }));
          break;
          
        case 'users':
          // Search for users with public lists
          const users = await getUsersBySubstring(term);
          searchResults = users.map(user => ({ type: 'user' as const, data: user }));
          break;
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter chip selection
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // Render different result types
  const renderListResult = (list: List) => (
    <TouchableOpacity 
      style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={() => setSelectedList(list)}
    >
      {list.coverImageURL && (
        <Image 
          source={{ uri: list.coverImageURL }} 
          style={styles.resultImage} 
        />
      )}
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{list.title}</Text>
        {list.description && (
          <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {list.description}
          </Text>
        )}
        <View style={styles.resultMeta}>
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {list.ownerID === currentUser?.id ? 'Your list' : 'Public list'}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onPress
          // Navigate to list
          setSelectedList(list);
        }}
      >
        <Icon name="arrow-forward-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderItemResult = (item: Item) => {
    console.log('Rendering item:', item.id, item.title, item.content?.substring(0, 50));
    return (
      <TouchableOpacity 
        style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        onPress={() => {
          console.log('Item pressed:', item.id);
          setSelectedItem(item);
        }}
      >
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.title || 'Untitled'}</Text>
          <Text style={[styles.resultDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {stripHtml(item.content || '')}
          </Text>
          <View style={styles.resultMeta}>
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>Item</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onPress
            console.log('Item arrow pressed:', item.id);
            setSelectedItem(item);
          }}
        >
          <Icon name="arrow-forward-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderUserResult = (user: User) => (
    <View style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={[styles.avatarContainer, { backgroundColor: user.avatarURL ? 'transparent' : colors.backgroundSecondary }]}>
        {user.avatarURL ? (
          <Image source={{ uri: user.avatarURL }} style={styles.avatar} />
        ) : (
          <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{user.username.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{user.username}</Text>
        <Text style={[styles.resultDescription, { color: colors.textSecondary }]}>User with public lists</Text>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setSelectedUser(user)}
      >
        <Icon name="arrow-forward-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // Render a search result based on its type
  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    switch (item.type) {
      case 'list':
        return renderListResult(item.data as List);
      case 'item':
        return renderItemResult(item.data as Item);
      case 'user':
        return renderUserResult(item.data as User);
      default:
        return null;
    }
  };

  const handleBackFromListScreen = () => {
    setSelectedList(null);
  };

  const handleBackFromItemScreen = () => {
    setSelectedItem(null);
  };

  const handleBackFromUserScreen = () => {
    setSelectedUser(null);
  };

  // If a user is selected, show the UserScreen
  if (selectedUser) {
    return <UserScreen user={selectedUser} onBack={handleBackFromUserScreen} />;
  }

  // If a list is selected, show the ListScreen
  if (selectedList) {
    return <ListScreen list={selectedList} onBack={handleBackFromListScreen} />;
  }

  // If an item is selected, show the ItemScreen
  if (selectedItem) {
    console.log('Showing ItemScreen for item:', selectedItem.id);
    return (
      <ItemScreen 
        item={selectedItem} 
        onBack={() => {
          console.log('Back from ItemScreen');
          setSelectedItem(null);
        }} 
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { 
        backgroundColor: colors.inputBackground, 
        shadowColor: colors.shadow,
        borderColor: colors.inputBorder,
        borderWidth: 1
      }]}>
        <Icon name="search-outline" size={24} color={colors.iconSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.inputText }]}
          placeholder="Search..."
          placeholderTextColor={colors.inputPlaceholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchTerm('')}
            style={styles.clearButton}
          >
            <Icon name="close-circle-outline" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: activeFilter === 'library' ? colors.primary : colors.backgroundSecondary }
          ]}
          onPress={() => handleFilterChange('library')}
        >
          <Text 
            style={[
              styles.chipText,
              { color: activeFilter === 'library' ? 'white' : colors.textSecondary }
            ]}
          >
            Library
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: activeFilter === 'lists' ? colors.primary : colors.backgroundSecondary }
          ]}
          onPress={() => handleFilterChange('lists')}
        >
          <Text 
            style={[
              styles.chipText,
              { color: activeFilter === 'lists' ? 'white' : colors.textSecondary }
            ]}
          >
            Lists
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: activeFilter === 'items' ? colors.primary : colors.backgroundSecondary }
          ]}
          onPress={() => handleFilterChange('items')}
        >
          <Text 
            style={[
              styles.chipText,
              { color: activeFilter === 'items' ? 'white' : colors.textSecondary }
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            { backgroundColor: activeFilter === 'users' ? colors.primary : colors.backgroundSecondary }
          ]}
          onPress={() => handleFilterChange('users')}
        >
          <Text 
            style={[
              styles.chipText,
              { color: activeFilter === 'users' ? 'white' : colors.textSecondary }
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results or Empty State */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => `${item.type}-${(item.data as any).id || index}`}
          contentContainerStyle={styles.resultsList}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : null
          }
        />
      ) : (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : searchTerm ? (
            <>
              <Icon name="search-off-outline" size={64} color={colors.divider} />
              <Text style={[styles.message, { color: colors.textTertiary }]}>
                No results found for "{searchTerm}"
              </Text>
            </>
          ) : (
            <>
              <Icon name="search-outline" size={64} color={colors.divider} />
              <Text style={[styles.message, { color: colors.textTertiary }]}>
                Search your library, public lists, and users
              </Text>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 80,
    maxHeight: 40,
    alignItems: 'center',
  },
  chipText: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});

export default SearchScreen; 