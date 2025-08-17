import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import {
  Text,
  IconButton,
  Checkbox,
  Button,
  Portal,
  Modal,
  useTheme,
  FAB,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigationState } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types';
import { getListById, updateList } from '../utils/storage';
import { List, ListItem } from '../types';
import { generateUUID } from '../utils/uuid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';

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
  const [editingItemImage, setEditingItemImage] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const theme = useTheme();
  const navigationState = useNavigationState(state => state);
  const isDeepLinked = navigationState?.routes.length === 1;

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (list) {
      navigation.setOptions({
        headerTitle: list.title,
        headerRight: () => (
          <IconButton
            icon="qrcode"
            size={24}
            onPress={() => setShowQR(true)}
            style={styles.headerButton}
            iconColor="white"
          />
        ),
      });
    }
  }, [list, navigation]);

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

  const pickImage = async (itemId: string) => {
    setSelectedItemId(itemId);
    setShowImagePickerModal(true);
  };

  const handleImageSource = async (source: 'camera' | 'library') => {
    setShowImagePickerModal(false);
    if (!selectedItemId) return;

    try {
      const result = await (source === 'camera'
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          }));

      if (!result.canceled && result.assets[0]) {
        setEditingItemImage(result.assets[0].uri);
        handleUpdateItemImage(selectedItemId, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setSelectedItemId(null);
    }
  };

  const handleUpdateItemImage = async (itemId: string, imageUrl: string) => {
    if (!list) return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, imageUrl } : item
    );

    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
  };

  const handleRemoveImage = async (itemId: string) => {
    if (!list) return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, imageUrl: undefined } : item
    );

    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await handleUpdateList(updatedList);
  };

  const handleScanQR = () => {
    navigation.navigate('ScanQR', { mode: 'view' });
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
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              }
              style={styles.headerButton}
            />
          )}
        </View>
      </View>

      <ScrollView style={styles.itemsList}>
        {list.items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => toggleItem(item.id)}
            />
            <View style={styles.itemContent}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
              ) : null}
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
                  style={[styles.itemText, item.completed && styles.completedItem]}
                  onPress={() => {
                    setEditingItemId(item.id);
                    setEditingItemText(item.text);
                  }}
                >
                  {item.text}
                </Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <IconButton
                icon={item.imageUrl ? 'image-edit' : 'image-plus'}
                size={20}
                onPress={() => pickImage(item.id)}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteItem(item.id)}
                style={styles.actionButton}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <ActionButton label="Add Item" onPress={handleAddItem} />
      </SafeAreaView>

      <FAB
        icon="qrcode-scan"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleScanQR}
      />

      <Portal>
        <Modal
          visible={showQR}
          onDismiss={() => setShowQR(false)}
          contentContainerStyle={styles.modalContent}
        >
          {/* <Text style={styles.modalTitle}>Scan to View List</Text> */}
          <View style={styles.qrContainer}>
            <QRCode value={Linking.createURL(`/list/${list.id}`)} size={200} />
          </View>
          <View style={styles.modalButtons}>
            <ActionButton
              label="Print"
              onPress={handlePrintQR}
              style={styles.printButton}
              size="xs"
            />
            <ActionButton
              label="Close"
              onPress={() => setShowQR(false)}
              style={styles.closeButton}
              variant="outline"
              size="xs"
            />
          </View>
        </Modal>

        <Modal
          visible={showImagePickerModal}
          onDismiss={() => setShowImagePickerModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>
            {selectedItemId && list?.items.find(item => item.id === selectedItemId)?.imageUrl
              ? 'Edit Image'
              : 'Add Image'}
          </Text>
          <View style={styles.imagePickerButtons}>
            {selectedItemId && list?.items.find(item => item.id === selectedItemId)?.imageUrl ? (
              <ActionButton
                label="Remove Image"
                onPress={() => {
                  handleRemoveImage(selectedItemId);
                  setShowImagePickerModal(false);
                }}
                style={styles.imagePickerButton}
                variant="error"
                icon="delete"
              />
            ) : (
              <>
                <ActionButton
                  label="Take Photo"
                  onPress={() => handleImageSource('camera')}
                  style={styles.imagePickerButton}
                  icon="camera"
                />
                <ActionButton
                  label="Choose from Library"
                  onPress={() => handleImageSource('library')}
                  style={styles.imagePickerButton}
                  icon="image"
                />
              </>
            )}
            <ActionButton
              label="Cancel"
              onPress={() => setShowImagePickerModal(false)}
              style={styles.imagePickerButton}
              variant="outline"
            />
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
    paddingBottom: 0,
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
    paddingBottom: 80,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
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
  footer: {
    paddingTop: 8,
  },
  imagePickerButtons: {
    width: '100%',
    gap: 8,
  },
  imagePickerButton: {
    marginVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Position above the Add Item button
  },
});
