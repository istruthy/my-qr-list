import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text, IconButton, Checkbox, Button, Portal, Modal, useTheme, FAB } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigationState } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types';
import { getListById, updateList } from '../utils/storage';
import { List, ListItem } from '../types';
import { generateUUID } from '../utils/uuid';

type ViewListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ViewList'>;
  route: RouteProp<RootStackParamList, 'ViewList'>;
};

export const ViewListScreen: React.FC<ViewListScreenProps> = ({ navigation, route }) => {
  const [list, setList] = useState<List | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const theme = useTheme();
  const navigationState = useNavigationState(state => state);
  const isDeepLinked = navigationState?.routes.length === 1;

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    const loadedList = await getListById(route.params.listId);
    if (loadedList) {
      setList(loadedList);
      setEditingTitle(loadedList.title);
    }
  };

  const handleUpdateList = async (updatedList: List) => {
    await updateList(updatedList);
    setList(updatedList);
  };

  const toggleItem = async (itemId: string) => {
    if (!list) return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!list) return;

    const updatedItems = list.items.filter(item => item.id !== itemId);
    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
  };

  const handleEditTitle = async () => {
    if (!list || editingTitle.trim() === '') return;

    const updatedList = {
      ...list,
      title: editingTitle.trim(),
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
    setIsEditingTitle(false);
  };

  const handleEditItem = async (itemId: string) => {
    if (!list || editingItemText.trim() === '') return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, text: editingItemText.trim() } : item
    );

    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleAddItem = async () => {
    if (!list) return;

    const newItem: ListItem = {
      id: await generateUUID(),
      text: '',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedList = {
      ...list,
      items: [...list.items, newItem],
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
    setEditingItemId(newItem.id);
    setEditingItemText('');
  };

  const handlePrintQR = async () => {
    if (!list) return;

    try {
      const expoUrl = Linking.createURL(`/list/${list.id}`);
      const html = `
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                background-color: white;
              }
              .container {
                text-align: center;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #333;
              }
              .qr-container {
                padding: 20px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .instructions {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${list.title}</h1>
              <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(expoUrl)}" width="200" height="200" />
              </div>
              <p class="instructions">Scan this QR code to view the list</p>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({
        html,
        width: 612, // US Letter width in points
        height: 792, // US Letter height in points
      });
    } catch (error) {
      console.error('Error printing QR code:', error);
    }
  };

  if (!list) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isDeepLinked && (
            <IconButton
              icon="home"
              size={24}
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })}
              style={styles.headerButton}
            />
          )}
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={editingTitle}
              onChangeText={setEditingTitle}
              onBlur={handleEditTitle}
              onSubmitEditing={handleEditTitle}
              autoFocus
            />
          ) : (
            <Text style={styles.title} onPress={() => setIsEditingTitle(true)}>
              {list.title}
            </Text>
          )}
        </View>
        <IconButton
          icon="qrcode"
          size={24}
          onPress={() => setShowQR(true)}
          style={styles.headerButton}
        />
      </View>

      <ScrollView style={styles.itemsList}>
        {list.items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => toggleItem(item.id)}
            />
            {editingItemId === item.id ? (
              <TextInput
                style={styles.itemInput}
                value={editingItemText}
                onChangeText={setEditingItemText}
                onBlur={() => handleEditItem(item.id)}
                onSubmitEditing={() => handleEditItem(item.id)}
                autoFocus
              />
            ) : (
              <Text
                style={[
                  styles.itemText,
                  item.completed && styles.completedItem,
                ]}
                onPress={() => {
                  setEditingItemId(item.id);
                  setEditingItemText(item.text);
                }}
              >
                {item.text}
              </Text>
            )}
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteItem(item.id)}
            />
          </View>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddItem}
      />

      <Portal>
        <Modal
          visible={showQR}
          onDismiss={() => setShowQR(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Scan to View List</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={Linking.createURL(`/list/${list.id}`)}
              size={200}
            />
          </View>
          <View style={styles.modalButtons}>
            <Button
              mode="contained"
              onPress={handlePrintQR}
              style={styles.printButton}
            >
              Print QR Code
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowQR(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#6200ee',
  },
  headerButton: {
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
    marginLeft: 8,
  },
  itemInput: {
    flex: 1,
    marginLeft: 8,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#6200ee',
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  printButton: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 