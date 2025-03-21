import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, Checkbox, Button, Portal, Modal, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { RootStackParamList } from '../types';
import { getListById, updateList } from '../utils/storage';
import { List, ListItem } from '../types';

type ViewListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ViewList'>;
  route: RouteProp<RootStackParamList, 'ViewList'>;
};

export const ViewListScreen: React.FC<ViewListScreenProps> = ({ navigation, route }) => {
  const [list, setList] = useState<List | null>(null);
  const [showQR, setShowQR] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    const loadedList = await getListById(route.params.listId);
    if (loadedList) {
      setList(loadedList);
    }
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

    await updateList(updatedList);
    setList(updatedList);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!list) return;

    const updatedItems = list.items.filter(item => item.id !== itemId);
    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    await updateList(updatedList);
    setList(updatedList);
  };

  const handlePrintQR = async () => {
    if (!list) return;

    try {
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
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`myqrlist://list/${list.id}`)}" width="200" height="200" />
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
        <Text style={styles.title}>{list.title}</Text>
        <IconButton
          icon="qrcode"
          size={24}
          onPress={() => setShowQR(true)}
          style={styles.qrButton}
        />
      </View>

      <ScrollView style={styles.itemsList}>
        {list.items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => toggleItem(item.id)}
            />
            <Text
              style={[
                styles.itemText,
                item.completed && styles.completedItem,
              ]}
            >
              {item.text}
            </Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteItem(item.id)}
            />
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={showQR}
          onDismiss={() => setShowQR(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Scan to View List</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={`myqrlist://list/${list.id}`}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  qrButton: {
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
}); 