import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, IconButton, Text, Portal, Modal, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { saveList } from '../utils/storage';
import { List, ListItem } from '../types';
import { generateUUID } from '../utils/uuid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';

type CreateListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateList'>;
  route: RouteProp<RootStackParamList, 'CreateList'>;
};

export const CreateListScreen: React.FC<CreateListScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Watch for scanned barcode updates
  useEffect(() => {
    if (route.params?.scannedBarcode) {
      setBarcode(route.params.scannedBarcode);
    }
  }, [route.params?.scannedBarcode]);

  const handleAddItem = async () => {
    if (newItem.trim()) {
      const newListItem: ListItem = {
        id: await generateUUID(),
        text: newItem.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
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
      setError('Please enter a title');
      return;
    }

    try {
      const newList: List = {
        id: Date.now().toString(),
        title: title.trim(),
        items,
        barcode: barcode || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveList(newList);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving list:', error);
      setError('Failed to save list');
    }
  };

  const handleScanCode = () => {
    setShowBarcodeModal(false);
    navigation.navigate('ScanQR', {
      mode: 'create',
      onCodeScanned: (scannedCode: string) => {
        setBarcode(scannedCode);
      },
    });
  };

  const handleSkipBarcode = () => {
    setShowBarcodeModal(false);
  };

  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={showBarcodeModal}
          onDismiss={handleSkipBarcode}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Associate with QR/Barcode</Text>
          <Text style={styles.modalDescription}>
            Would you like to associate this list with an existing QR code or barcode?
          </Text>
          <View style={styles.modalButtons}>
            <ActionButton
              label="Yes, Scan Code"
              onPress={handleScanCode}
              style={styles.modalButton}
            />
            <ActionButton
              label="No, Skip"
              onPress={handleSkipBarcode}
              style={styles.modalButton}
              variant="outline"
            />
          </View>
        </Modal>
      </Portal>

      <View style={styles.titleContainer}>
        <TextInput
          label="List Title"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />
        <IconButton icon="barcode-scan" size={24} onPress={handleScanCode} />
      </View>

      {barcode && (
        <View style={styles.barcodeContainer}>
          <Text variant="bodySmall">Barcode: {barcode}</Text>
          <IconButton icon="close" size={20} onPress={() => setBarcode(null)} />
        </View>
      )}

      <View style={styles.addItemContainer}>
        <TextInput
          label="New Item"
          value={newItem}
          onChangeText={setNewItem}
          style={styles.itemInput}
          onSubmitEditing={handleAddItem}
        />
        <IconButton icon="plus" size={24} onPress={handleAddItem} style={styles.addButton} />
      </View>

      <ScrollView style={styles.itemsList}>
        {items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.text}</Text>
            <IconButton icon="delete" size={20} onPress={() => handleRemoveItem(item.id)} />
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <ActionButton
          label="Save List"
          onPress={handleSave}
          disabled={!title.trim() || items.length === 0}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleInput: {
    flex: 1,
    marginRight: 8,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
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
    paddingBottom: 80,
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
  footer: {
    paddingTop: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    width: '100%',
    gap: 8,
  },
  modalButton: {
    marginVertical: 4,
  },
});
