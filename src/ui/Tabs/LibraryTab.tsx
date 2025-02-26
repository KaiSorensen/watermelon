import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserLibrary } from '../../services/databaseService';
import { Folder, List, Library } from '../../data/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LibraryScreen = () => {
  const { currentUser } = useAuth();
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const userLibrary = await fetchUserLibrary(currentUser.uid);
          setLibrary(userLibrary);

          // By default, expand all folders
          const folderIds = new Set<string>();
          const addFolderIds = (folders: Folder[]) => {
            folders.forEach(folder => {
              folderIds.add(folder.id);
              if (folder.folders.length > 0) {
                addFolderIds(folder.folders);
              }
            });
          };

          if (userLibrary.rootFolders) {
            addFolderIds(userLibrary.rootFolders);
          }

          setExpandedFolders(folderIds);
        } catch (error) {
          console.error('Error loading library:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadLibrary();
  }, [currentUser]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleAllFolders = () => {
    if (allExpanded) {
      setExpandedFolders(new Set());
    } else {
      const folderIds = new Set<string>();
      const addFolderIds = (folders: Folder[]) => {
        folders.forEach(folder => {
          folderIds.add(folder.id);
          if (folder.folders.length > 0) {
            addFolderIds(folder.folders);
          }
        });
      };

      if (library?.rootFolders) {
        addFolderIds(library.rootFolders);
      }

      setExpandedFolders(folderIds);
    }
    setAllExpanded(!allExpanded);
  };

  const renderListItem = (list: List, paddingLeft: number) => (
    <TouchableOpacity
      key={list.id}
      style={[styles.listItem, { paddingLeft }]}
      onPress={() => console.log('List pressed', list.id)}
      onLongPress={() => console.log('Long press on list', list.id)}
      delayLongPress={200}
    >
      <Icon name="list" size={20} color="#4CAF50" style={styles.listIcon} />
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{list.name}</Text>
        {list.description && (
          <Text style={styles.listDescription} numberOfLines={1}>
            {list.description}
          </Text>
        )}
      </View>
      <View style={styles.listMeta}>
        {list.isPublic && (
          <View style={styles.publicBadge}>
            <Icon name="public" size={14} color="#fff" />
            <Text style={styles.publicText}>Public</Text>
          </View>
        )}
        {list.downloadCount > 0 && (
          <View style={styles.downloadCount}>
            <Icon name="file-download" size={14} color="#666" />
            <Text style={styles.downloadText}>{list.downloadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = useCallback((folder: Folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const paddingLeft = 16 + level * 20;

    return (
      <View key={folder.id} style={styles.folderContainer}>
        <TouchableOpacity
          style={[styles.folderHeader, { paddingLeft }]}
          onPress={() => toggleFolder(folder.id)}
          onLongPress={() => console.log('Long press on folder', folder.id)}
          delayLongPress={200}
        >
          <Icon
            name={isExpanded ? 'folder-open' : 'folder'}
            size={24}
            color="#FFD700"
            style={styles.folderIcon}
          />
          <Text style={styles.folderName}>{folder.name}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color="#888"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.folderContent}>
            {folder.folders.map(subFolder =>
              renderFolderItem(subFolder, level + 1)
            )}

            {folder.lists.map(list => renderListItem(list, paddingLeft))}
          </View>
        )}
      </View>
    );
  }, [expandedFolders]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading your library...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userProfile}>
          {currentUser?.photoURL ? (
            <Image
              source={{ uri: currentUser.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.defaultAvatar]}>
              <Icon name="person" size={24} color="#fff" />
            </View>
          )}
          <Text style={styles.username}>
            {currentUser?.username || currentUser?.displayName || 'User'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.collapseButton}
          onPress={toggleAllFolders}
        >
          <Text style={styles.collapseButtonText}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {library?.rootFolders && library.rootFolders.length > 0 ? (
          library.rootFolders.map(folder => renderFolderItem(folder))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="folder" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No folders yet</Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create a folder</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  collapseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#555',
  },
  content: {
    flex: 1,
  },
  folderContainer: {
    marginBottom: 2,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    backgroundColor: 'white',
  },
  folderIcon: {
    marginRight: 10,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  folderContent: {
    backgroundColor: '#fafafa',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    backgroundColor: 'white',
  },
  listIcon: {
    marginRight: 10,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '500',
  },
  listDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  publicText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  downloadCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4285F4',
    borderRadius: 24,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  defaultAvatar: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LibraryScreen; 