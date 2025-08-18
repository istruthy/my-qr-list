import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton, useTheme, Searchbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { RootStackParamList } from '../types';
import { getAllLists, deleteList } from '../utils/storage';
import { List, ListItem } from '../types';
import { ActionButton } from '../components/ActionButton';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_SPACING = 16;
const CARD_OFFSET = (screenWidth - CARD_WIDTH) / 2;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type SearchResult = {
  listId: string;
  listTitle: string;
  item: ListItem;
};

type ListOrSearchResult = List | SearchResult;

// Separate component for animated cards to avoid hooks violation
const CarouselCard: React.FC<{
  item: ListOrSearchResult;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
  onDelete?: () => void;
}> = ({ item, index, scrollX, onPress, onDelete }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const input = scrollX.value;
    const translateX = input - (CARD_WIDTH + CARD_SPACING) * index;

    const scale = interpolate(
      translateX,
      [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      translateX,
      [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if ('items' in item) {
    // This is a List
    return (
      <Animated.View key={item.id} style={[styles.cardContainer, animatedStyle]}>
        <Card style={styles.card} onPress={onPress}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">{item.title}</Text>
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={onDelete}
                  style={styles.deleteButton}
                />
              )}
            </View>
            <Text variant="bodyMedium">{item.items.length} items</Text>
            {item.barcode && (
              <Text variant="bodySmall" style={styles.barcodeText}>
                Barcode: {item.barcode}
              </Text>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  } else {
    // This is a SearchResult
    return (
      <Animated.View
        key={`${item.listId}-${item.item.id}`}
        style={[styles.cardContainer, animatedStyle]}
      >
        <Card style={styles.card} onPress={onPress}>
          <Card.Content>
            <Text variant="titleMedium">{item.listTitle}</Text>
            <Text variant="bodyMedium">{item.item.text}</Text>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const theme = useTheme();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const loadLists = async () => {
    try {
      const loadedLists = await getAllLists();
      console.log('Loaded lists:', loadedLists);
      setLists(loadedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadLists();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    lists.forEach(list => {
      list.items.forEach(item => {
        if (item.text.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            listId: list.id,
            listTitle: list.title,
            item,
          });
        }
      });
    });
    setSearchResults(results);
  };

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
    loadLists();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderCarousel = () => {
    const data = searchQuery ? searchResults : lists;

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="titleMedium" style={styles.emptyStateTitle}>
            {searchQuery ? 'No search results found' : 'No lists yet'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyStateSubtitle}>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first list to get started'}
          </Text>
        </View>
      );
    }

    return (
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <CarouselCard
            key={'items' in item ? item.id : `${item.listId}-${item.item.id}`}
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => {
              if ('items' in item) {
                navigation.navigate('ViewList', { listId: item.id });
              } else {
                navigation.navigate('ViewList', { listId: item.listId });
              }
            }}
            onDelete={'items' in item ? () => handleDeleteList(item.id) : undefined}
          />
        ))}
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search your items..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      <View style={styles.carouselWrapper}>{renderCarousel()}</View>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <ActionButton label="Create New List" onPress={() => navigation.navigate('CreateList')} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    margin: 0,
  },
  searchBar: {
    marginBottom: 16,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContainer: {
    paddingHorizontal: CARD_OFFSET,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    height: 160,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    margin: 0,
  },
  barcodeText: {
    marginTop: 8,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  footer: {
    paddingTop: 8,
  },
});
