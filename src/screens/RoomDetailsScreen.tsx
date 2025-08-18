import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Portal,
  Modal,
  TextInput,
  Chip,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { PropertiesStackParamList } from '../types';
import { ActionButton } from '../components/ActionButton';
import { generateUUID } from '../utils/uuid';

type RoomDetailsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'RoomDetails'>;
  route: RouteProp<PropertiesStackParamList, 'RoomDetails'>;
};

type InventoryItem = {
  id: string;
  name: string;
  description?: string;
  expectedQuantity: number;
  actualQuantity?: number;
  barcode?: string;
  status: 'pending' | 'verified' | 'damaged' | 'missing';
  damageReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type DamageReason = 'broken' | 'missing' | 'worn' | 'stained' | 'other';

const DAMAGE_REASONS: DamageReason[] = ['broken', 'missing', 'worn', 'stained', 'other'];

export const RoomDetailsScreen: React.FC<RoomDetailsScreenProps> = ({ navigation, route }) => {
  const { roomId, roomName, propertyId } = route.params;
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [damageReason, setDamageReason] = useState<DamageReason>('broken');
  const [damageNotes, setDamageNotes] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [roomCompletionStatus, setRoomCompletionStatus] = useState({
    totalItems: 0,
    completedItems: 0,
    completionPercentage: 0,
    isCompleted: false,
  });
  const theme = useTheme();

  // Add header button for adding items
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="plus"
          onPress={() => setShowAddModal(true)}
          style={{ marginRight: 8 }}
          iconColor="#fff"
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadInventoryItems();
  }, [roomId]);

  // Check room completion status whenever inventory items change
  useEffect(() => {
    checkRoomCompletion();
  }, [inventoryItems]);

  const checkRoomCompletion = () => {
    const totalItems = inventoryItems.length;
    const completedItems = inventoryItems.filter(
      item => item.status === 'verified' || item.status === 'damaged' || item.status === 'missing'
    ).length;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const isCompleted = completionPercentage === 100;

    setRoomCompletionStatus({
      totalItems,
      completedItems,
      completionPercentage,
      isCompleted,
    });

    // Auto-show completion modal if room is completed
    if (isCompleted && !showCompletionModal) {
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 500);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setIsLoading(true);
      // TODO: Load from database when ready
      // For now, using mock data
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: 'Coffee Table',
          description: 'Wooden coffee table with glass top',
          expectedQuantity: 1,
          actualQuantity: 1,
          status: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Sofa',
          description: '3-seater fabric sofa',
          expectedQuantity: 1,
          actualQuantity: 1,
          status: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Lamp',
          description: 'Table lamp with shade',
          expectedQuantity: 2,
          actualQuantity: 1,
          status: 'missing',
          damageReason: 'missing',
          notes: 'One lamp not found during inspection',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Rug',
          description: 'Area rug 8x10',
          expectedQuantity: 1,
          actualQuantity: 1,
          status: 'damaged',
          damageReason: 'stained',
          notes: 'Large coffee stain in center',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setInventoryItems(mockItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemQuantity.trim()) {
      Alert.alert('Error', 'Please enter item name and quantity');
      return;
    }

    const quantity = parseInt(newItemQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const newItem: InventoryItem = {
      id: await generateUUID(),
      name: newItemName.trim(),
      description: newItemDescription.trim() || undefined,
      expectedQuantity: quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInventoryItems([...inventoryItems, newItem]);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemQuantity('1');
  };

  const handleScanItem = (item: InventoryItem) => {
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'item',
      propertyId: propertyId,
      roomId: roomId,
      onItemScanned: (itemId: string) => {
        if (itemId === item.id) {
          handleQuantityUpdate(item, item.expectedQuantity);
        }
      },
    });
  };

  const handleQuantityUpdate = (item: InventoryItem, newQuantity: number) => {
    const updatedItems = inventoryItems.map(invItem =>
      invItem.id === item.id
        ? {
            ...invItem,
            actualQuantity: newQuantity,
            status: 'verified' as const,
            updatedAt: new Date().toISOString(),
          }
        : invItem
    );
    setInventoryItems(updatedItems);
  };

  const handleDamageReport = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDamageModal(true);
    setDamageReason('broken');
    setDamageNotes('');
  };

  const submitDamageReport = () => {
    if (!selectedItem) return;

    const updatedItems = inventoryItems.map(invItem =>
      invItem.id === selectedItem.id
        ? {
            ...invItem,
            status: 'damaged' as const,
            damageReason,
            notes: damageNotes.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : invItem
    );
    setInventoryItems(updatedItems);
    setShowDamageModal(false);
    setSelectedItem(null);
  };

  const showRoomCompletionModal = () => {
    setShowCompletionModal(true);
  };

  const handleRoomCompleted = () => {
    setShowCompletionModal(false);
    // TODO: Mark room as completed in database using markListAsCompleted service
    // For now, we'll just navigate back
    navigation.goBack();
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'verified':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'damaged':
        return '#f44336';
      case 'missing':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'verified':
        return '✓ Verified';
      case 'pending':
        return '⏳ Pending';
      case 'damaged':
        return '⚠️ Damaged';
      case 'missing':
        return '❌ Missing';
      default:
        return 'Unknown';
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Text variant="titleMedium" style={styles.itemName}>
            {item.name}
          </Text>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        {item.description && (
          <Text variant="bodyMedium" style={styles.itemDescription}>
            {item.description}
          </Text>
        )}

        <View style={styles.quantitySection}>
          <Text variant="bodyMedium" style={styles.quantityLabel}>
            Expected: {item.expectedQuantity}
          </Text>
          {item.actualQuantity !== undefined && (
            <Text variant="bodyMedium" style={styles.quantityLabel}>
              Actual: {item.actualQuantity}
            </Text>
          )}
        </View>

        {item.damageReason && (
          <View style={styles.damageSection}>
            <Text variant="bodySmall" style={styles.damageLabel}>
              Damage: {item.damageReason.charAt(0).toUpperCase() + item.damageReason.slice(1)}
            </Text>
            {item.notes && (
              <Text variant="bodySmall" style={styles.damageNotes}>
                Notes: {item.notes}
              </Text>
            )}
          </View>
        )}

        <View style={styles.itemActions}>
          <Button
            mode="outlined"
            onPress={() => handleScanItem(item)}
            style={styles.actionButton}
            icon="qrcode-scan"
          >
            Scan
          </Button>

          {item.status === 'pending' && (
            <Button
              mode="outlined"
              onPress={() => {
                const newQuantity = prompt(
                  'Enter actual quantity:',
                  item.expectedQuantity.toString()
                );
                if (newQuantity) {
                  const quantity = parseInt(newQuantity);
                  if (!isNaN(quantity) && quantity >= 0) {
                    handleQuantityUpdate(item, quantity);
                  }
                }
              }}
              style={styles.actionButton}
              icon="counter"
            >
              Update Qty
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={() => handleDamageReport(item)}
            style={styles.actionButton}
            icon="alert"
          >
            Report Issue
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="headlineMedium">Loading Inventory...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced stats header with completion progress */}
      <View style={styles.statsHeader}>
        <View style={styles.completionOverview}>
          <Text variant="titleMedium" style={styles.completionTitle}>
            Room Completion: {roomCompletionStatus.completionPercentage}%
          </Text>
          <ProgressBar
            progress={roomCompletionStatus.completionPercentage / 100}
            color={
              roomCompletionStatus.isCompleted
                ? '#4caf50'
                : roomCompletionStatus.completionPercentage > 50
                  ? '#ff9800'
                  : '#f44336'
            }
            style={styles.completionProgressBar}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="titleMedium" style={styles.statNumber}>
              {roomCompletionStatus.totalItems}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyMedium" style={styles.statNumber}>
              {roomCompletionStatus.completedItems}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Completed
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyMedium" style={styles.statNumber}>
              {roomCompletionStatus.totalItems - roomCompletionStatus.completedItems}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Remaining
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="bodyMedium" style={styles.statNumber}>
              {
                inventoryItems.filter(
                  item => item.status === 'damaged' || item.status === 'missing'
                ).length
              }
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Issues
            </Text>
          </View>
        </View>
      </View>

      {inventoryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No inventory items yet</Text>
          <Text style={styles.emptyStateSubtext}>Add items to track in this room</Text>
          <ActionButton
            label="Add First Item"
            onPress={() => setShowAddModal(true)}
            style={styles.addFirstButton}
          />
        </View>
      ) : (
        <FlatList
          data={inventoryItems}
          renderItem={renderInventoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Item Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add Inventory Item</Text>

          <TextInput
            label="Item Name *"
            value={newItemName}
            onChangeText={setNewItemName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Coffee Table, Lamp"
          />

          <TextInput
            label="Description"
            value={newItemDescription}
            onChangeText={setNewItemDescription}
            style={styles.input}
            mode="outlined"
            placeholder="Brief description of the item"
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Expected Quantity *"
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            style={styles.input}
            mode="outlined"
            placeholder="1"
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <ActionButton
              label="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <ActionButton label="Add Item" onPress={handleAddItem} style={styles.modalButton} />
          </View>
        </Modal>
      </Portal>

      {/* Damage Report Modal */}
      <Portal>
        <Modal
          visible={showDamageModal}
          onDismiss={() => setShowDamageModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Report Damage/Issue</Text>

          {selectedItem && <Text style={styles.modalSubtitle}>Item: {selectedItem.name}</Text>}

          <Text style={styles.modalLabel}>Issue Type:</Text>
          <View style={styles.reasonChips}>
            {DAMAGE_REASONS.map(reason => (
              <Chip
                key={reason}
                selected={damageReason === reason}
                onPress={() => setDamageReason(reason)}
                style={styles.reasonChip}
                mode="outlined"
              >
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Additional Notes"
            value={damageNotes}
            onChangeText={setDamageNotes}
            style={styles.input}
            mode="outlined"
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalButtons}>
            <ActionButton
              label="Cancel"
              onPress={() => setShowDamageModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <ActionButton
              label="Submit Report"
              onPress={submitDamageReport}
              style={styles.modalButton}
            />
          </View>
        </Modal>
      </Portal>

      {/* Room Completion Modal */}
      <Portal>
        <Modal
          visible={showCompletionModal}
          onDismiss={() => setShowCompletionModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>🎉 Room Completed!</Text>
          <Text style={styles.modalSubtitle}>{roomName}</Text>
          <Text style={styles.modalBody}>
            All items in this room have been validated. Great job!
          </Text>
          <View style={styles.modalButtons}>
            <ActionButton label="OK" onPress={handleRoomCompleted} style={styles.modalButton} />
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsHeader: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196f3',
    fontSize: 18,
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  itemsList: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  itemDescription: {
    color: '#666',
    marginBottom: 12,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityLabel: {
    color: '#2196f3',
    fontWeight: '500',
  },
  damageSection: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  damageLabel: {
    color: '#f57c00',
    fontWeight: '500',
  },
  damageNotes: {
    color: '#f57c00',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addFirstButton: {
    minWidth: 200,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonChip: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionOverview: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  completionProgressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
});
