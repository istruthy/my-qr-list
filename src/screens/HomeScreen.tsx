import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card, IconButton, useTheme, Searchbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { getAllLists, deleteList } from '../utils/storage';
import { List, ListItem } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type SearchResult = {
  listId: string;
  listTitle: string;
  item: ListItem;
};

type ListOrSearchResult = List | SearchResult;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const theme = useTheme();

  const loadLists = async () => {
    const loadedLists = await getAllLists();
    setLists(loadedLists);
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ViewList', { listId: item.listId })}
    >
      <Card.Content>
        <Text variant="titleMedium">{item.listTitle}</Text>
        <Text variant="bodyMedium">{item.item.text}</Text>
      </Card.Content>
    </Card>
  );

  const renderList = ({ item }: { item: List }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ViewList', { listId: item.id })}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">{item.title}</Text>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteList(item.id)}
            style={styles.deleteButton}
          />
        </View>
        <Text variant="bodyMedium">{item.items.length} items</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search your items..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
      />

      <FlatList<ListOrSearchResult>
        data={searchQuery ? searchResults : lists}
        renderItem={({ item }) =>
          'items' in item ? renderList({ item }) : renderSearchResult({ item })
        }
        keyExtractor={item => ('items' in item ? item.id : `${item.listId}-${item.item.id}`)}
        contentContainerStyle={styles.list}
      />

      <SafeAreaView
        edges={['bottom']}
        style={[styles.footer, { backgroundColor: theme.colors.background }]}
      >
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateList')}
          style={styles.createButton}
          labelStyle={styles.buttonLabel}
        >
          Create New List
        </Button>
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
  list: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    margin: 0,
  },
  footer: {
    paddingTop: 8,
  },
  createButton: {
    marginHorizontal: 16,
    borderRadius: 40,
    padding: 16,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});
