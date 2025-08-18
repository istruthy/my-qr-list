import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Portal,
  Modal,
  TextInput,
  IconButton,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertiesStackParamList } from '../types';
import { ActionButton } from '../components/ActionButton';
import { generateUUID } from '../utils/uuid';
import { ListWithCompletion } from '../db/schema';

type PropertyDetailsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'PropertyDetails'>;
  route: RouteProp<PropertiesStackParamList, 'PropertyDetails'>;
};

type Room = ListWithCompletion;

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const theme = useTheme();

  // Add header button for adding rooms
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

  console.log('PropertyDetailsScreen: Component rendered with propertyId:', propertyId);
  console.log('PropertyDetailsScreen: Current state - property:', property, 'rooms:', rooms);

  useEffect(() => {
    console.log('PropertyDetailsScreen: useEffect triggered');
    const loadData = async () => {
      await loadPropertyAndRooms();
    };
    loadData();
  }, [propertyId]);

  const loadPropertyAndRooms = useCallback(async () => {
    console.log('PropertyDetailsScreen: Loading data for propertyId:', propertyId);

    // TODO: Load from database when ready
    // For now, we'll use mock data
    const mockProperty = {
      id: propertyId,
      name: `Property ${propertyId}`,
      address: `Address for Property ${propertyId}`,
    };
    setProperty(mockProperty);
    console.log('PropertyDetailsScreen: Set property:', mockProperty);

    const mockRooms: Room[] = [
      {
        id: '1',
        name: 'Living Room',
        description: 'Main living area',
        propertyId: propertyId,
        barcode: 'LR001',
        isCompleted: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 15,
        completedItemCount: 15,
        completionPercentage: 100,
      },
      {
        id: '2',
        name: 'Kitchen',
        description: 'Kitchen and dining area',
        propertyId: propertyId,
        barcode: 'KT001',
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 23,
        completedItemCount: 18,
        completionPercentage: 78,
      },
      {
        id: '3',
        name: 'Master Bedroom',
        description: 'Primary bedroom',
        propertyId: propertyId,
        barcode: 'MB001',
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 12,
        completedItemCount: 0,
        completionPercentage: 0,
      },
    ];
    console.log('PropertyDetailsScreen: About to set rooms:', mockRooms);
    setRooms(mockRooms);
    console.log('PropertyDetailsScreen: Set rooms called, current state should update');
  }, [propertyId]);

  // Calculate overall property completion
  const propertyCompletion = {
    totalRooms: rooms.length,
    completedRooms: rooms.filter(room => room.isCompleted).length,
    completionPercentage:
      rooms.length > 0
        ? Math.round((rooms.filter(room => room.isCompleted).length / rooms.length) * 100)
        : 0,
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    const newRoom: Room = {
      id: await generateUUID(),
      name: newRoomName.trim(),
      description: newRoomDescription.trim() || undefined,
      propertyId: propertyId,
      barcode: null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
      completedItemCount: 0,
      completionPercentage: 0,
    };

    setRooms([...rooms, newRoom]);
    setShowAddModal(false);
    setNewRoomName('');
    setNewRoomDescription('');
  };

  const handleSelectRoom = (room: Room) => {
    navigation.navigate('RoomDetails', {
      roomId: room.id,
      roomName: room.name,
      propertyId: propertyId,
    });
  };

  const handleScanQR = () => {
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'room',
      propertyId: propertyId,
      onRoomScanned: (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          navigation.navigate('RoomDetails', {
            roomId: room.id,
            roomName: room.name,
            propertyId: propertyId,
          });
        }
      },
    });
  };

  const renderRoom = ({ item }: { item: Room }) => {
    console.log('PropertyDetailsScreen: Rendering room:', item);
    return (
      <Card style={styles.roomCard} onPress={() => handleSelectRoom(item)}>
        <Card.Content>
          <View style={styles.roomHeader}>
            <Text variant="titleLarge" style={styles.roomName}>
              🏠 {item.name}
            </Text>
            {/* Completion status chip */}
            <Chip
              mode="flat"
              textStyle={styles.completionChipText}
              style={[
                styles.completionChip,
                {
                  backgroundColor: item.isCompleted
                    ? '#4caf50'
                    : item.completionPercentage > 50
                      ? '#ff9800'
                      : '#f44336',
                },
              ]}
            >
              {item.isCompleted ? '✅ Complete' : `${item.completionPercentage}%`}
            </Chip>
          </View>

          {item.description && (
            <Text variant="bodyMedium" style={styles.roomDescription}>
              {item.description}
            </Text>
          )}

          {/* Completion progress section */}
          <View style={styles.completionSection}>
            <View style={styles.completionStats}>
              <Text variant="bodyMedium" style={styles.completionText}>
                📦 {item.completedItemCount}/{item.itemCount} items verified
              </Text>
              <Text variant="bodySmall" style={styles.completionPercentage}>
                {item.completionPercentage}% complete
              </Text>
            </View>
            <ProgressBar
              progress={item.completionPercentage / 100}
              color={
                item.isCompleted
                  ? '#4caf50'
                  : item.completionPercentage > 50
                    ? '#ff9800'
                    : '#f44336'
              }
              style={styles.progressBar}
            />
          </View>

          <View style={styles.roomInfo}>
            {item.barcode && (
              <Text variant="bodySmall" style={styles.barcodeInfo}>
                🏷️ Has QR Code
              </Text>
            )}
            {item.isCompleted && item.completedAt && (
              <Text variant="bodySmall" style={styles.completedDate}>
                ✅ Completed: {new Date(item.completedAt as string).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.roomActions}>
            <Button
              mode="outlined"
              onPress={() => handleScanQR()}
              style={styles.scanButton}
              icon="qrcode-scan"
            >
              Scan Room
            </Button>
            <Button
              mode="contained"
              onPress={() => handleSelectRoom(item)}
              style={styles.selectButton}
            >
              View Inventory
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!property) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property...</Text>
          <Text style={styles.loadingSubtext}>Property ID: {propertyId}</Text>
        </View>
      </View>
    );
  }

  console.log('PropertyDetailsScreen: Rendering with property:', property, 'and rooms:', rooms);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {property.name}
        </Text>
        {property.address && <Text style={styles.address}>📍 {property.address}</Text>}

        {/* Property completion overview */}
        <View style={styles.propertyCompletionSection}>
          <View style={styles.completionHeader}>
            <Text variant="titleMedium" style={styles.completionTitle}>
              Property Progress: {propertyCompletion.completionPercentage}%
            </Text>
            <Text variant="bodyMedium" style={styles.completionSubtitle}>
              {propertyCompletion.completedRooms}/{propertyCompletion.totalRooms} rooms completed
            </Text>
          </View>
          <ProgressBar
            progress={propertyCompletion.completionPercentage / 100}
            color={
              propertyCompletion.completionPercentage === 100
                ? '#4caf50'
                : propertyCompletion.completionPercentage > 50
                  ? '#ff9800'
                  : '#f44336'
            }
            style={styles.propertyProgressBar}
          />
        </View>

        <Text variant="bodyMedium" style={styles.subtitle}>
          Select a room to validate its inventory
        </Text>
      </View>

      {rooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No rooms yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add rooms to organize your inventory by location
          </Text>
          <ActionButton
            label="Add First Room"
            onPress={() => setShowAddModal(true)}
            style={styles.addFirstButton}
          />
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.roomsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add New Room</Text>

          <TextInput
            label="Room Name *"
            value={newRoomName}
            onChangeText={setNewRoomName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Living Room, Kitchen"
          />

          <TextInput
            label="Description"
            value={newRoomDescription}
            onChangeText={setNewRoomDescription}
            style={styles.input}
            mode="outlined"
            placeholder="Brief description of the room"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <ActionButton
              label="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <ActionButton label="Add Room" onPress={handleAddRoom} style={styles.modalButton} />
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
  address: {
    color: '#666',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  roomsList: {
    padding: 16,
  },
  roomCard: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  completionChip: {
    borderRadius: 5,
  },
  completionChipText: {
    fontWeight: 'bold',
    color: 'white',
  },
  roomDescription: {
    color: '#666',
    marginBottom: 12,
  },
  completionSection: {
    marginBottom: 12,
  },
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  completionText: {
    color: '#333',
    fontWeight: '500',
  },
  completionPercentage: {
    color: '#666',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  barcodeInfo: {
    color: '#4caf50',
    fontStyle: 'italic',
  },
  completedDate: {
    color: '#666',
    fontStyle: 'italic',
  },
  roomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scanButton: {
    marginTop: 8,
  },
  selectButton: {
    marginTop: 8,
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
    marginBottom: 20,
    textAlign: 'center',
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
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  testButton: {
    marginTop: 10,
  },
  propertyCompletionSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  completionSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  propertyProgressBar: {
    height: 8,
    borderRadius: 4,
  },
});
