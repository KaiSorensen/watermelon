import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { List } from '../../classes/List';
import { Item } from '../../classes/Item';
import PreviewItem from '../components/PreviewItem';
import { useAuth } from '../../contexts/UserContext';
import ListScreen from '../screens/ListScreen';

const TodayScreen = () => {
  const { currentUser, loading } = useAuth();
  const [todayLists, setTodayLists] = useState<List[]>([]);
  const [selectedListIndex, setSelectedListIndex] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined);
  const [loadingLists, setLoadingLists] = useState<boolean>(true);
  const [selectedListForView, setSelectedListForView] = useState<List | null>(null);
  const chipsScrollViewRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get('window');

  // Fetch today lists on component mount or when user changes
  useEffect(() => {
    const fetchTodayLists = async () => {
      if (!currentUser) {
        setTodayLists([]);
        setLoadingLists(false);
        return;
      }

      setLoadingLists(true);
      try {
        const lists = currentUser.getTodayLists();
        setTodayLists(lists);
        
        // Select first list if available
        if (lists.length > 0) {
          setSelectedListIndex(0);
          // In the future, we'll fetch the today item for the selected list
          // const todayItem = await lists[0].getTodayItem();
          // setCurrentItem(todayItem);
        }
      } catch (error) {
        console.error('Error fetching today lists:', error);
      } finally {
        setLoadingLists(false);
      }
    };

    if (!loading) {
      fetchTodayLists();
    }
  }, [currentUser, loading]);

  // Handle chip selection
  const handleChipPress = (index: number) => {
    // If the chip is already selected, open the list view
    if (selectedListIndex === index) {
      setSelectedListForView(todayLists[index]);
      return;
    }
    
    setSelectedListIndex(index);
    // In the future, we'll fetch the today item for the selected list
    // const todayItem = todayLists[index].getTodayItem();
    // setCurrentItem(todayItem);
    
    // Scroll to center the selected chip
    scrollToSelectedChip(index);
  };

  // Scroll to center the selected chip
  const scrollToSelectedChip = (index: number) => {
    if (chipsScrollViewRef.current && todayLists.length > 0) {
      // Calculate position to center the chip
      const chipWidth = 120; // Approximate width of a chip including margins
      const scrollToX = index * chipWidth - (width / 2) + (chipWidth / 2);
      
      chipsScrollViewRef.current.scrollTo({ 
        x: Math.max(0, scrollToX), 
        animated: true 
      });
    }
  };

  // Handle swipe on preview item
  const handleSwipeLeft = () => {
    if (selectedListIndex < todayLists.length - 1) {
      handleChipPress(selectedListIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (selectedListIndex > 0) {
      handleChipPress(selectedListIndex - 1);
    }
  };

  const handleBackFromListScreen = () => {
    setSelectedListForView(null);
  };

  // Conditionally render ListScreen if a list is selected for viewing
  if (selectedListForView) {
    return <ListScreen list={selectedListForView} onBack={handleBackFromListScreen} />;
  }

  // Show loading state while fetching user or lists
  if (loading || loadingLists) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.subtitle}>Your daily items</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading your lists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show login prompt if no user
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.subtitle}>Your daily items</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Not Logged In</Text>
          <Text style={styles.emptySubtitle}>
            Please log in to see your today lists
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Your daily items</Text>
      </View>

      {todayLists.length > 0 ? (
        <>
          {/* Horizontal scrollable chips */}
          <ScrollView
            ref={chipsScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {todayLists.map((list, index) => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.chip,
                  selectedListIndex === index && styles.selectedChip
                ]}
                onPress={() => handleChipPress(index)}
              >
                <Text 
                  style={[
                    styles.chipText,
                    selectedListIndex === index && styles.selectedChipText
                  ]}
                >
                  {list.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Preview item */}
          <View style={styles.previewContainer}>
            <PreviewItem 
              item={currentItem}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Today Lists</Text>
          <Text style={styles.emptySubtitle}>
            Mark lists as "Today" in your list settings to see them here
          </Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
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
    minWidth: 100,
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
  previewContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default TodayScreen;