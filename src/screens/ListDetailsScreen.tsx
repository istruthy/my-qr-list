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
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LIST } from '../graphql/queries';
import { TOGGLE_ITEM_COMPLETION } from '../graphql/mutations';
import { PropertiesStackParamList } from '../types';
import { List } from '../graphql/types';
import { ActionButton } from '../components/ActionButton';
import { generateUUID } from '../utils/uuid';

type ListDetailsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'ListDetails'>;
  route: RouteProp<PropertiesStackParamList, 'ListDetails'>;
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

export const ListDetailsScreen: React.FC<ListDetailsScreenProps> = ({ navigation, route }) => {
  const { listId, listName, propertyId } = route.params;
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL query to get list details
  const { data, loading, error, refetch } = useQuery<{ list: List }, { id: string }>(GET_LIST, {
    variables: { id: listId },
    onError: error => {
      console.error('Error fetching list:', error);
    },
  });

  // Automatically refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('ListDetailsScreen: Screen focused, refetching data...');
      refetch();
    }, [refetch])
  );

  // GraphQL mutation to update item completion status
  const [updateItemCompletion, { loading: updateLoading }] = useMutation(TOGGLE_ITEM_COMPLETION, {
    onError: error => {
      console.error('Error updating item completion:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    },
    onCompleted: data => {
      console.log('Item completion updated successfully:', data);
    },
  });

  // Handle focus changes to manage modal state
  useEffect(() => {
    return () => {
      // Cleanup when leaving the screen
    };
  }, []);

  console.log(
    'ListDetailsScreen: GraphQL query state - loading:',
    loading,
    'error:',
    error,
    'data:',
    data
  );
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
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
          onPress={() => navigation.navigate('AddItem', { listId, propertyId })}
          style={{ marginRight: 8 }}
          iconColor="#fff"
        />
      ),
    });
  }, [navigation, listId, propertyId]);

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
      console.log('ListDetailsScreen: Transformed GraphQL items:', transformedItems);
    }
  }, [data, listId]);

  // Check room completion status whenever inventory items change
  useEffect(() => {
    if (inventoryItems.length > 0) {
      const totalItems = inventoryItems.length;
      const completedItems = inventoryItems.filter(item => item.isCompleted).length;
      const completionPercentage = Math.round((completedItems / totalItems) * 100);
      const isCompleted = completedItems === totalItems;

      setRoomCompletionStatus({
        totalItems,
        completedItems,
        completionPercentage,
        isCompleted,
      });
    }
  }, [inventoryItems]);

  const handleScanItem = (item: InventoryItem) => {
    // Navigate to the root stack to access ScanQR screen
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'item',
      propertyId: propertyId,
      listId: listId,
      onItemScanned: (itemId: string) => {
        if (itemId === item.id) {
          // Handle item verification logic here
          console.log('ListDetailsScreen: Item scanned for verification:', item.name);
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

  if (isLoading || loading || updateLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="headlineMedium">Loading Inventory...</Text>
          <Text style={styles.loadingSubtext}>List ID: {listId}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="headlineMedium">Error Loading List</Text>
          <Text style={styles.loadingSubtext}>Failed to load list data</Text>
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
            List Completion: {roomCompletionStatus.completionPercentage}%
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
            label="Mark List as Complete"
            onPress={showRoomCompletionModal}
            style={styles.completionButton}
            variant="primary"
            icon="check-circle"
          />
          <Text style={styles.completionButtonText}>
            Mark list as complete when all items are verified
          </Text>
        </View>
      )}

      {inventoryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No inventory items yet</Text>
          <Text style={styles.emptyStateSubtext}>Add items to track in this list</Text>
          <ActionButton
            label="Add First Item"
            onPress={() => navigation.navigate('AddItem', { listId, propertyId })}
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
          <Text style={styles.modalTitle}>🎉 List Completed!</Text>
          <Text style={styles.modalSubtitle}>{listName}</Text>
          <Text style={styles.modalBody}>
            All items in this list have been validated. Great job!
          </Text>
          <View style={styles.modalButtons}>
            <ActionButton label="OK" onPress={handleRoomCompleted} style={styles.modalButton} />
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

// Remove unused styles
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addFirstButton: {
    marginTop: 20,
    backgroundColor: '#1e3a8a',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: 'white',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDetail: {
    fontSize: 12,
    color: '#888',
    marginRight: 16,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#333',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e3a8a',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  damageModalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  damageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  damageReasonContainer: {
    marginBottom: 16,
  },
  damageReasonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  damageReasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  damageReasonChip: {
    marginBottom: 8,
  },
  damageNotesInput: {
    marginBottom: 16,
  },
  damageModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  damageModalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  completionModalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  completionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  completionModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  completionModalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
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
  actionButton: {
    flex: 1,
    minWidth: 100,
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
  testButton: {
    marginTop: 10,
  },
  statsHeader: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  itemsList: {
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
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
  modalBody: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ListDetailsScreen;
