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
  ActivityIndicator,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROPERTY, GET_PROPERTIES } from '../graphql/queries';
import { CREATE_ROOM } from '../graphql/mutations';
import { PropertiesStackParamList } from '../types';
import { ActionButton } from '../components/ActionButton';
import { generateUUID } from '../utils/uuid';
import { Property, Room, CreateRoomInput, ItemStatus } from '../graphql/types';
import { useGraphQL } from '../hooks/useGraphQL';

type PropertyDetailsScreenProps = {
  navigation: NativeStackNavigationProp<PropertiesStackParamList, 'PropertyDetails'>;
  route: RouteProp<PropertiesStackParamList, 'PropertyDetails'>;
};

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { propertyId } = route.params;
  console.log('PropertyDetailsScreen: Received propertyId from route.params:', propertyId);
  console.log('PropertyDetailsScreen: Full route.params:', route.params);
  console.log(
    'PropertyDetailsScreen: Note: Rooms functionality now working with aliased lists data'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const theme = useTheme();

  const { useSafeQuery, useSafeMutation } = useGraphQL();
  console.log(' == property id', propertyId);
  // GraphQL query to fetch property with rooms
  const { data, loading, error, refetch } = useSafeQuery<{ property: Property }, { id: string }>(
    GET_PROPERTY,
    {
      variables: { id: propertyId },
      onError: error => {
        console.error('Error fetching property:', error);
        Alert.alert('Error', 'Failed to load property data. Please try again.');
      },
    }
  );

  console.log(
    'PropertyDetailsScreen: GraphQL query state - loading:',
    loading,
    'error:',
    error,
    'data:',
    data
  );

  // Debug: Log the actual GraphQL query being sent
  console.log('PropertyDetailsScreen: GraphQL query:', GET_PROPERTY.loc?.source.body);
  console.log('PropertyDetailsScreen: Query variables:', { id: propertyId });
  console.log('PropertyDetailsScreen: Raw data response:', JSON.stringify(data, null, 2));

  // Test query to see if we can fetch any properties at all
  const { data: allPropertiesData } = useSafeQuery<{ properties: Property[] }, {}>(GET_PROPERTIES, {
    onError: error => {
      console.error('Error fetching all properties:', error);
    },
  });
  console.log('PropertyDetailsScreen: All properties test query result:', allPropertiesData);

  // GraphQL mutation to create a new room
  const [createRoom, { loading: isCreatingRoom }] = useSafeMutation<
    { createRoom: Room },
    { input: CreateRoomInput }
  >(CREATE_ROOM, {
    onCompleted: data => {
      console.log('Room created successfully:', data);
      setShowAddModal(false);
      setNewRoomName('');
      setNewRoomDescription('');
      // Refetch the property data to get the updated room list
      refetch();
      Alert.alert('Success', 'Room created successfully!');
    },
    onError: error => {
      console.error('Error creating room:', error);
      Alert.alert('Error', 'Failed to create room. Please try again.');
    },
  });

  // Extract property and rooms from GraphQL response
  const property = data?.property;
  const rooms = data?.property?.rooms || [];

  // Add header button for adding rooms
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="refresh"
            onPress={() => {
              console.log('PropertyDetailsScreen: Manual refetch triggered');
              refetch();
            }}
            style={{ marginRight: 4 }}
            iconColor="#fff"
          />
          <IconButton
            icon="plus"
            onPress={() => setShowAddModal(true)}
            style={{ marginRight: 8 }}
            iconColor="#fff"
          />
        </View>
      ),
    });
  }, [navigation]);

  console.log('PropertyDetailsScreen: Component rendered with propertyId:', propertyId);
  console.log('PropertyDetailsScreen: Current state - property:', property, 'rooms:', rooms);

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    const roomInput: CreateRoomInput = {
      name: newRoomName.trim(),
      description: newRoomDescription.trim() || undefined,
      propertyId: propertyId,
    };

    try {
      await createRoom({
        variables: { input: roomInput },
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  const handleSelectRoom = (room: Room) => {
    navigation.navigate('RoomDetails', {
      roomId: room.id,
      roomName: room.name,
      propertyId: propertyId,
    });
  };

  const handleScanQR = () => {
    // Navigate to the root stack to access ScanQR screen
    navigation.getParent()?.navigate('ScanQR', {
      mode: 'room',
      propertyId: propertyId,
      onRoomScanned: (roomId: string) => {
        const room = rooms.find((r: Room) => r.id === roomId);
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

  // Calculate overall property completion
  const propertyCompletion = {
    totalRooms: rooms.length,
    completedRooms: rooms.filter((room: any) => {
      const itemCount = room.items?.length || 0;
      const completedItemCount =
        room.items?.filter((item: any) => item.isCompleted === true).length || 0;
      return itemCount > 0 && completedItemCount === itemCount;
    }).length,
    completionPercentage:
      rooms.length > 0
        ? Math.round(
            (rooms.filter((room: any) => {
              const itemCount = room.items?.length || 0;
              const completedItemCount =
                room.items?.filter((item: any) => item.isCompleted === true).length || 0;
              return itemCount > 0 && completedItemCount === itemCount;
            }).length /
              rooms.length) *
              100
          )
        : 0,
  };

  const renderRoom = ({ item }: { item: any }) => {
    console.log('PropertyDetailsScreen: Rendering room:', item);

    // Calculate completion percentage for the room
    const itemCount = item.items?.length || 0;
    const completedItemCount =
      item.items?.filter((item: any) => item.isCompleted === true).length || 0;
    const completionPercentage =
      itemCount > 0 ? Math.round((completedItemCount / itemCount) * 100) : 0;
    const isCompleted = completionPercentage === 100;

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
                  backgroundColor: isCompleted
                    ? '#4caf50'
                    : completionPercentage > 50
                      ? '#ff9800'
                      : '#f44336',
                },
              ]}
            >
              {isCompleted ? '✅ Complete' : `${completionPercentage}%`}
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
                📦 {completedItemCount}/{itemCount} items completed
              </Text>
              <Text variant="bodySmall" style={styles.completionPercentage}>
                {completionPercentage}% complete
              </Text>
            </View>
            <ProgressBar
              progress={completionPercentage / 100}
              color={isCompleted ? '#4caf50' : completionPercentage > 50 ? '#ff9800' : '#f44336'}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.roomInfo}>
            {item.barcode && (
              <Text variant="bodySmall" style={styles.barcodeInfo}>
                📱 Barcode: {item.barcode}
              </Text>
            )}
            {isCompleted && (
              <Text variant="bodySmall" style={styles.completedDate}>
                ✅ Completed: {new Date(item.updatedAt).toLocaleDateString()}
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading property...</Text>
          <Text style={styles.loadingSubtext}>Property ID: {propertyId}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error loading property</Text>
          <Text style={styles.loadingSubtext}>Please try again</Text>
          <Button mode="contained" onPress={() => refetch()} style={styles.testButton}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  // No property found
  if (!property) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Property not found</Text>
          <Text style={styles.loadingSubtext}>Property ID: {propertyId}</Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.testButton}>
            Go Back
          </Button>
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
          <Text style={styles.emptyStateText}>No rooms found</Text>
          <Text style={styles.emptyStateSubtext}>
            This property doesn't have any rooms yet. Add rooms to organize your inventory.
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
          keyExtractor={(item: any) => item.id}
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
            disabled={isCreatingRoom}
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
            disabled={isCreatingRoom}
          />

          <View style={styles.modalButtons}>
            <ActionButton
              label="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
              disabled={isCreatingRoom}
            />
            <ActionButton
              label={isCreatingRoom ? 'Creating...' : 'Add Room'}
              onPress={handleAddRoom}
              style={styles.modalButton}
              disabled={isCreatingRoom}
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
