import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/UserContext';
import { Folder } from '../../classes/Folder';
import { List } from '../../classes/List';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserSettingsScreen from '../screens/UserSettingsScreen';
import ListScreen from '../screens/ListScreen';

const LibraryScreen = () => {
  const { currentUser, loading } = useAuth();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const toggleAllFolders = () => {
    if (allExpanded) {
      // Collapse all folders
      setExpandedFolders(new Set());
    } else {
      // Expand all folders
      const newExpandedFolders = new Set<string>();
      
      const addFolderIds = (folders: Folder[]) => {
        for (const folder of folders) {
          newExpandedFolders.add(folder.id);
          if (folder.subFolders.length > 0) {
            addFolderIds(folder.subFolders);
          }
        }
      };
      
      if (currentUser) {
        addFolderIds(currentUser.rootFolders);
      }
      
      setExpandedFolders(newExpandedFolders);
    }
    
    setAllExpanded(!allExpanded);
  };

  const renderListItem = (list: List, paddingLeft: number = 16) => (
    <TouchableOpacity
      key={list.id}
      style={[styles.listItem, { paddingLeft }]}
      onPress={() => setSelectedList(list)}
    >
      <View style={styles.listItemContent}>
        {list.coverImageURL ? (
          <Image source={{ uri: list.coverImageURL }} style={styles.listCover} />
        ) : (
          <View style={styles.listCoverPlaceholder}>
            <Icon name="list" size={20} color="#999" />
          </View>
        )}
        <View style={styles.listInfo}>
          <Text style={styles.listTitle}>{list.title}</Text>
          {list.description && (
            <Text style={styles.listDescription} numberOfLines={1}>
              {list.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = (folder: Folder, level: number = 0) => {
    const paddingLeft = 16 + level * 20;
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <View key={folder.id}>
        <TouchableOpacity
          style={[styles.folderItem, { paddingLeft }]}
          onPress={() => toggleFolder(folder.id)}
        >
          <Icon
            name={isExpanded ? 'folder-open' : 'folder'}
            size={24}
            color="#FFB74D"
            style={styles.folderIcon}
          />
          <Text style={styles.folderName}>{folder.name}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            color="#999"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.folderContent}>
            {folder.subFolders.map(subFolder =>
              renderFolderItem(subFolder, level + 1)
            )}

            {folder.listsIDs.map(listId => {
              const list = currentUser?.getList(listId);
              if (list) {
                return renderListItem(list, paddingLeft + 20);
              }
              return null;
            })}
          </View>
        )}
      </View>
    );
  };

  const handleBackFromListScreen = () => {
    setSelectedList(null);
  };

  if (selectedList) {
    return <ListScreen list={selectedList} onBack={handleBackFromListScreen} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userProfile}>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            {currentUser?.avatarURL ? (
              <Image
                source={{ uri: currentUser.avatarURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="person" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Text style={styles.username}>
              {currentUser?.username || 'User'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleAllFolders} style={styles.expandButton}>
          <Icon
            name={allExpanded ? 'unfold-less' : 'unfold-more'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {currentUser?.rootFolders && currentUser.rootFolders.length > 0 ? (
            currentUser.rootFolders.map(folder => renderFolderItem(folder))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Your library is empty</Text>
              <Text style={styles.emptyStateSubtext}>
                Create folders and lists to organize your content
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showSettings}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>User Settings</Text>
            <View style={{ width: 24 }} />
          </View>
          <UserSettingsScreen />
        </SafeAreaView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  folderIcon: {
    marginRight: 12,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listCover: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  listCoverPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LibraryScreen; 