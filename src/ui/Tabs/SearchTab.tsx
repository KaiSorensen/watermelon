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
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import debounce from 'lodash.debounce';
import ListScreen from '../screens/ListScreen';

// Define filter types
type FilterType = 'library' | 'lists' | 'items' | 'users';

// Define result types for the union type
type SearchResult = {
  type: 'list' | 'item' | 'user';
  data: List | Item | User;
};

const SearchScreen = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('library');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

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
      style={styles.resultItem}
      onPress={() => setSelectedList(list)}
    >
      {list.coverImageURL && (
        <Image 
          source={{ uri: list.coverImageURL }} 
          style={styles.resultImage} 
        />
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{list.title}</Text>
        {list.description && (
          <Text style={styles.resultDescription} numberOfLines={2}>
            {list.description}
          </Text>
        )}
        <View style={styles.resultMeta}>
          <Text style={styles.metaText}>
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
        <Icon name="arrow-forward" size={24} color="#4285F4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderItemResult = (item: Item) => (
    <View style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={styles.metaText}>Item</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => {/* Navigate to item */}}
      >
        <Icon name="arrow-forward" size={24} color="#4285F4" />
      </TouchableOpacity>
    </View>
  );

  const renderUserResult = (user: User) => (
    <View style={styles.resultItem}>
      <View style={[styles.avatarContainer, { backgroundColor: user.avatarURL ? 'transparent' : '#e0e0e0' }]}>
        {user.avatarURL ? (
          <Image source={{ uri: user.avatarURL }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{user.username}</Text>
        <Text style={styles.resultDescription}>User with public lists</Text>
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => {/* Navigate to user profile */}}
      >
        <Icon name="arrow-forward" size={24} color="#4285F4" />
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

  // Conditionally render ListScreen if a list is selected
  if (selectedList) {
    return <ListScreen list={selectedList} onBack={handleBackFromListScreen} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchTerm('')}
            style={styles.clearButton}
          >
            <Icon name="clear" size={20} color="#888" />
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
            activeFilter === 'library' && styles.selectedChip
          ]}
          onPress={() => handleFilterChange('library')}
        >
          <Text 
            style={[
              styles.chipText,
              activeFilter === 'library' && styles.selectedChipText
            ]}
          >
            Library
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            activeFilter === 'lists' && styles.selectedChip
          ]}
          onPress={() => handleFilterChange('lists')}
        >
          <Text 
            style={[
              styles.chipText,
              activeFilter === 'lists' && styles.selectedChipText
            ]}
          >
            Lists
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            activeFilter === 'items' && styles.selectedChip
          ]}
          onPress={() => handleFilterChange('items')}
        >
          <Text 
            style={[
              styles.chipText,
              activeFilter === 'items' && styles.selectedChipText
            ]}
          >
            Items
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            activeFilter === 'users' && styles.selectedChip
          ]}
          onPress={() => handleFilterChange('users')}
        >
          <Text 
            style={[
              styles.chipText,
              activeFilter === 'users' && styles.selectedChipText
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
              <ActivityIndicator style={styles.loader} color="#4285F4" />
            ) : null
          }
        />
      ) : (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#4285F4" />
          ) : searchTerm ? (
            <>
              <Icon name="search-off" size={64} color="#ddd" />
              <Text style={styles.message}>
                No results found for "{searchTerm}"
              </Text>
            </>
          ) : (
            <>
              <Icon name="search" size={64} color="#ddd" />
              <Text style={styles.message}>
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
    backgroundColor: '#f9f9f9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 80,
    maxHeight: 40,
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#3498db',
  },
  chipText: {
    color: '#555',
    fontWeight: '500',
  },
  selectedChipText: {
    color: 'white',
    fontWeight: 'bold',
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
    color: '#888',
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
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
    color: '#666',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
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
    color: '#555',
  },
  loader: {
    marginVertical: 20,
  },
});

export default SearchScreen; 