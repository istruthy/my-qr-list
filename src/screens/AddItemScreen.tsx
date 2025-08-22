import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import { CREATE_ITEM } from '../graphql/mutations';
import { PropertiesStackParamList } from '../types';
import { CreateItemInput } from '../graphql/types';

type AddItemScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'AddItem'>;
  route: RouteProp<PropertiesStackParamList, 'AddItem'>;
};

export const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation, route }) => {
  const { listId, propertyId } = route.params;
  const theme = useTheme();

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemBarcode, setItemBarcode] = useState('');

  // GraphQL mutation to create new item
  const [createItem, { loading: isCreatingItem }] = useMutation(CREATE_ITEM, {
    onError: error => {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to create item. Please try again.');
    },
    onCompleted: data => {
      console.log('Item created successfully:', data);
      Alert.alert('Success', 'Item created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
  });

  const handleScanBarcode = () => {
    console.log('AddItemScreen: Starting barcode scan...');
    // Navigate to the QR scanner using parent navigation
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'item',
      propertyId: propertyId,
      listId: listId,
      onItemScanned: (barcode: string) => {
        console.log('AddItemScreen: Barcode scanned callback received:', barcode);
        setItemBarcode(barcode);
        console.log('AddItemScreen: Barcode state updated, should return to this screen');
        // Don't navigate back here - ScanQRScreen will handle it
      },
      onScanCancelled: () => {
        console.log('AddItemScreen: Barcode scan cancelled callback received');
        console.log('AddItemScreen: Should return to this screen without changes');
        // Don't navigate back here - ScanQRScreen will handle it
      },
    });
  };

  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const itemInput: CreateItemInput = {
      listId: listId,
      name: itemName.trim(),
      description: itemDescription.trim() || undefined,
      quantity: parseInt(itemQuantity) || 1,
      barcode: itemBarcode.trim() || undefined,
    };

    try {
      await createItem({
        variables: { input: itemInput },
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Add Inventory Item
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Create a new item for this list
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Item Name *"
            value={itemName}
            onChangeText={setItemName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Coffee Table, Lamp"
          />

          <TextInput
            label="Description"
            value={itemDescription}
            onChangeText={setItemDescription}
            style={styles.input}
            mode="outlined"
            placeholder="Brief description of the item"
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Expected Quantity *"
            value={itemQuantity}
            onChangeText={setItemQuantity}
            style={styles.input}
            mode="outlined"
            placeholder="1"
            keyboardType="numeric"
          />

          <View style={styles.barcodeSection}>
            <TextInput
              label="Barcode (optional)"
              value={itemBarcode}
              onChangeText={setItemBarcode}
              style={[styles.input, styles.barcodeInput]}
              mode="outlined"
              placeholder="Scan or enter barcode"
            />
            <View style={styles.barcodeButtons}>
              {itemBarcode ? (
                <Button
                  mode="outlined"
                  onPress={() => setItemBarcode('')}
                  icon="close"
                  style={styles.clearButton}
                >
                  Clear
                </Button>
              ) : null}
              <Button
                mode="outlined"
                onPress={handleScanBarcode}
                icon="qrcode-scan"
                style={styles.scanButton}
              >
                Scan
              </Button>
            </View>
          </View>

          <View style={styles.formButtons}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isCreatingItem}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateItem}
              style={styles.createButton}
              loading={isCreatingItem}
              disabled={isCreatingItem}
            >
              {isCreatingItem ? 'Creating...' : 'Create Item'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    color: '#666',
  },
  formCard: {
    margin: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  barcodeSection: {
    marginBottom: 16,
  },
  barcodeInput: {
    marginBottom: 8,
  },
  barcodeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    minWidth: 80,
  },
  scanButton: {
    minWidth: 80,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default AddItemScreen;
