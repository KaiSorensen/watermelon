import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { searchPublicLists, copyPublicList } from '../../supabase/databaseService';
import { List } from '../../structs/types';
import { useAuth } from '../../contexts/AuthContext';

const SearchScreen = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setResults([]);
    setLastDoc(null);
    setHasMore(true);
    
    try {
      const { lists, lastDoc: newLastDoc } = await searchPublicLists(searchTerm);
      setResults(lists);
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc);
    } catch (error) {
      console.error('Error searching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc) return;
    
    setLoading(true);
    
    try {
      const { lists, lastDoc: newLastDoc } = await searchPublicLists(searchTerm, lastDoc);
      setResults([...results, ...lists]);
      setLastDoc(newLastDoc);
      setHasMore(!!newLastDoc && lists.length > 0);
    } catch (error) {
      console.error('Error loading more lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyList = async (listId: string) => {
    if (!currentUser) return;
    
    try {
      // For now, we'll copy to the root (null parent folder)
      await copyPublicList(listId, null, currentUser.uid);
      // Show success message or navigate to the list
    } catch (error) {
      console.error('Error copying list:', error);
      // Show error message
    }
  };

  const renderListItem = ({ item }: { item: List }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        {item.description && (
          <Text style={styles.resultDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.resultMeta}>
          <View style={styles.downloadCount}>
            <Icon name="file-download" size={14} color="#666" />
            <Text style={styles.metaText}>{item.downloadCount}</Text>
          </View>
          <Text style={styles.metaText}>
            {item.items.length} items
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.copyButton}
        onPress={() => handleCopyList(item.id)}
      >
        <Icon name="add-circle-outline" size={24} color="#4285F4" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for lists..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
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

      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
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
                Search for public lists to add to your library
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
  downloadCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  copyButton: {
    justifyContent: 'center',
    paddingLeft: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default SearchScreen; 