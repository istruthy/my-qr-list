import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { saveList } from '../utils/storage';
import { List, ListItem } from '../types';
import { generateUUID } from '../utils/uuid';

type CreateListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateList'>;
};

export const CreateListScreen: React.FC<CreateListScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const theme = useTheme();

  const handleAddItem = async () => {
    if (newItem.trim()) {
      const newListItem: ListItem = {
        id: await generateUUID(),
        text: newItem.trim(),
        completed: false,
      };
      setItems([...items, newListItem]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    const newList: List = {
      id: await generateUUID(),
      title: title.trim(),
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveList(newList);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="List Title"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />
      
      <View style={styles.addItemContainer}>
        <TextInput
          label="New Item"
          value={newItem}
          onChangeText={setNewItem}
          style={styles.itemInput}
          onSubmitEditing={handleAddItem}
        />
        <IconButton
          icon="plus"
          size={24}
          onPress={handleAddItem}
          style={styles.addButton}
        />
      </View>

      <ScrollView style={styles.itemsList}>
        {items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleRemoveItem(item.id)}
            />
          </View>
        ))}
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        disabled={!title.trim() || items.length === 0}
      >
        Save List
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    margin: 0,
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemText: {
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
  },
}); 