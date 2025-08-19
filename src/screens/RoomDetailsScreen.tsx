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
  ActivityIndicator,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LIST } from '../graphql/queries';
import { UPDATE_ITEM_COMPLETION } from '../graphql/mutations';
import { PropertiesStackParamList } from '../types';
import { ActionButton } from '../components/ActionButton';
import { generateUUID } from '../utils/uuid';
import { useGraphQL } from '../hooks/useGraphQL';

type RoomDetailsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'RoomDetails'>;
  route: RouteProp<PropertiesStackParamList, 'RoomDetails'>;
};

type InventoryItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number; // Expected quantity from GraphQL
  condition?: string;
  estimatedValue?: number;
  isCompleted: boolean; // Completion status from GraphQL
  createdAt: string;
  // Additional fields for local state management
  actualQuantity?: number;
  damageReason?: string;
  notes?: string;
  status: 'pending' | 'verified' | 'damaged' | 'missing'; // Local status for UI
};

type DamageReason = 'broken' | 'missing' | 'worn' | 'stained' | 'other';

const DAMAGE_REASONS: DamageReason[] = ['broken', 'missing', 'worn', 'stained', 'other'];

export const RoomDetailsScreen: React.FC<RoomDetailsScreenProps> = ({ navigation, route }) => {
  const { roomId, roomName, propertyId } = route.params;
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { useSafeQuery } = useGraphQL();

  // GraphQL query to fetch room data
  console.log('RoomDetailsScreen: GraphQL query - roomId:', roomId);
  const {
    data,
    loading: graphqlLoading,
    error,
    refetch,
  } = useSafeQuery<{ list: any }, { id: string }>(GET_LIST, {
    variables: { id: roomId },
    onError: error => {
      console.error('Error fetching room data:', error);
      Alert.alert('Error', 'Failed to load room data. Please try again.');
    },
  });

  // GraphQL mutation to update item completion status
  const [updateItemCompletion, { loading: updateLoading }] = useMutation(UPDATE_ITEM_COMPLETION, {
    onError: error => {
      console.error('Error updating item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    },
    onCompleted: data => {
      console.log('Item completion updated successfully:', data);
    },
  });

  console.log(
    'RoomDetailsScreen: GraphQL query state - loading:',
    graphqlLoading,
    'error:',
    error,
    'data:',
    data
  );
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
    if (data?.list) {
      // Transform GraphQL data to match our local InventoryItem type
      const graphqlItems = data.list.items || [];
      const transformedItems: InventoryItem[] = graphqlItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        condition: item.condition,
        estimatedValue: item.estimatedValue,
        isCompleted: item.isCompleted,
        createdAt: item.createdAt,
        // Set local status based on isCompleted
        status: item.isCompleted ? 'verified' : 'pending',
        // Initialize actualQuantity as undefined (will be set when verified)
        actualQuantity: undefined,
      }));

      setInventoryItems(transformedItems);
      setIsLoading(false);
      console.log('RoomDetailsScreen: Transformed GraphQL items:', transformedItems);
    }
  }, [data, roomId]);

  // Check room completion status whenever inventory items change
  useEffect(() => {
    checkRoomCompletion();
  }, [inventoryItems]);

  const checkRoomCompletion = () => {
    const totalItems = inventoryItems.length;
    // Only count verified items as truly completed
    const completedItems = inventoryItems.filter(item => item.status === 'verified').length;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const isCompleted = completionPercentage === 100;

    setRoomCompletionStatus({
      totalItems,
      completedItems,
      completionPercentage,
      isCompleted,
    });

    // Auto-show completion modal when room is truly completed (all items verified)
    if (isCompleted && !showCompletionModal && totalItems > 0) {
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 1000);
    }
  };

  const loadInventoryItems = async () => {
    // This function is no longer needed as we're using GraphQL
    // Keeping it for compatibility but it's not used
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
      quantity: quantity,
      status: 'pending',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setInventoryItems([...inventoryItems, newItem]);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemQuantity('1');
  };

  const handleScanItem = (item: InventoryItem) => {
    // Navigate to the root stack to access ScanQR screen
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'item',
      propertyId: propertyId,
      roomId: roomId,
      onItemScanned: (itemId: string) => {
        if (itemId === item.id) {
          handleQuantityUpdate(item, item.quantity);
        }
      },
    });
  };

  const handleVerifyItem = async (item: InventoryItem) => {
    try {
      // Update the item completion status in the database
      await updateItemCompletion({
        variables: {
          id: item.id,
          isCompleted: true,
        },
      });

      // Update local state after successful database update
      const updatedItems = inventoryItems.map(invItem =>
        invItem.id === item.id
          ? {
              ...invItem,
              actualQuantity: item.quantity,
              status: 'verified' as const,
              isCompleted: true,
            }
          : invItem
      );
      setInventoryItems(updatedItems);

      console.log(`Item "${item.name}" marked as completed in database`);
    } catch (error) {
      console.error('Failed to update item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };

  const handleUnverifyItem = async (item: InventoryItem) => {
    try {
      // Update the item completion status in the database
      await updateItemCompletion({
        variables: {
          id: item.id,
          isCompleted: false,
        },
      });

      // Update local state after successful database update
      const updatedItems = inventoryItems.map(invItem =>
        invItem.id === item.id
          ? {
              ...invItem,
              status: 'pending' as const,
              isCompleted: false,
              actualQuantity: undefined,
            }
          : invItem
      );
      setInventoryItems(updatedItems);

      console.log(`Item "${item.name}" marked as incomplete in database`);
    } catch (error) {
      console.error('Failed to update item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };

  const handleQuantityUpdate = async (item: InventoryItem, newQuantity: number) => {
    try {
      // Update the item completion status in the database
      await updateItemCompletion({
        variables: {
          id: item.id,
          isCompleted: true,
        },
      });

      // Update local state after successful database update
      const updatedItems = inventoryItems.map(invItem =>
        invItem.id === item.id
          ? {
              ...invItem,
              actualQuantity: newQuantity,
              status: 'verified' as const,
              isCompleted: true,
            }
          : invItem
      );
      setInventoryItems(updatedItems);

      console.log(`Item "${item.name}" quantity updated and marked as completed in database`);
    } catch (error) {
      console.error('Failed to update item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };

  const handleDamageReport = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDamageModal(true);
    setDamageReason('broken');
    setDamageNotes('');
  };

  const submitDamageReport = async () => {
    if (!selectedItem) return;

    try {
      // Mark the item as not completed in the database
      await updateItemCompletion({
        variables: {
          id: selectedItem.id,
          isCompleted: false,
        },
      });

      // Update local state after successful database update
      const updatedItems = inventoryItems.map(invItem =>
        invItem.id === selectedItem.id
          ? {
              ...invItem,
              status: 'damaged' as const,
              damageReason,
              notes: damageNotes.trim() || undefined,
              isCompleted: false,
            }
          : invItem
      );
      setInventoryItems(updatedItems);
      setShowDamageModal(false);
      setSelectedItem(null);

      console.log(`Item "${selectedItem.name}" marked as damaged in database`);
    } catch (error) {
      console.error('Failed to update item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
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
            Expected: {item.quantity}
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
            Scan QR
          </Button>
          {item.status === 'pending' && (
            <Button
              mode="contained"
              onPress={() => handleVerifyItem(item)}
              style={styles.actionButton}
              icon="check"
              loading={updateLoading}
              disabled={updateLoading}
            >
              {updateLoading ? 'Updating...' : 'Verify'}
            </Button>
          )}
          {item.status === 'verified' && (
            <Button
              mode="outlined"
              onPress={() => handleUnverifyItem(item)}
              style={styles.actionButton}
              icon="undo"
              loading={updateLoading}
              disabled={updateLoading}
            >
              {updateLoading ? 'Updating...' : 'Unverify'}
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

  if (isLoading || graphqlLoading || updateLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="headlineMedium">Loading Inventory...</Text>
          <Text style={styles.loadingSubtext}>Room ID: {roomId}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="headlineMedium">Error Loading Room</Text>
          <Text style={styles.loadingSubtext}>Failed to load room data</Text>
          <Button mode="contained" onPress={() => refetch()} style={styles.testButton}>
            Retry
          </Button>
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

      {/* Manual completion button */}
      {!roomCompletionStatus.isCompleted && roomCompletionStatus.totalItems > 0 && (
        <View style={styles.completionButtonContainer}>
          <ActionButton
            label="Mark Room as Complete"
            onPress={showRoomCompletionModal}
            style={styles.completionButton}
            variant="primary"
            icon="check-circle"
          />
          <Text style={styles.completionButtonText}>
            Mark room as complete when all items are verified
          </Text>
        </View>
      )}

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
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
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
  completionButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  completionButton: {
    minWidth: '100%',
    marginBottom: 8,
  },
  completionButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  testButton: {
    marginTop: 10,
  },
});

export default RoomDetailsScreen;
