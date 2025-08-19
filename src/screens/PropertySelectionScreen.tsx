import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Image, Alert } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Card,
  Title,
  Paragraph,
  FAB,
  IconButton,
  ProgressBar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../graphql/queries';
import { MainTabParamList, PropertiesStackParamList } from '../types';
import { Property } from '../graphql/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;

type PropertySelectionScreenProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Properties'>,
    NativeStackNavigationProp<PropertiesStackParamList>
  >;
};

export const PropertySelectionScreen: React.FC<PropertySelectionScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  console.log('PropertySelectionScreen: Component rendering...');

  // GraphQL query to fetch all properties
  const { data, loading, error, refetch } = useQuery<{ properties: Property[] }>(GET_PROPERTIES, {
    onError: error => {
      console.error('Error fetching properties:', error);
      Alert.alert('Error', 'Failed to load properties. Please try again.');
    },
  });

  // Extract properties from GraphQL response
  const properties = data?.properties || [];
  console.log('PropertySelectionScreen: Fetched properties from GraphQL:', properties);
  console.log('PropertySelectionScreen: Properties count:', properties.length);
  console.log('PropertySelectionScreen: Loading state:', loading);
  console.log('PropertySelectionScreen: Error state:', error);
  console.log('PropertySelectionScreen: Raw data:', data);

  // Fallback data for debugging - remove this once GraphQL is working
  const fallbackProperties = [
    {
      id: 'debug-1',
      name: 'Debug Property 1',
      address: '123 Debug St, Test City',
      rooms: [],
    },
    {
      id: 'debug-2',
      name: 'Debug Property 2',
      address: '456 Debug Ave, Test City',
      rooms: [],
    },
  ];

  // Use fallback data if GraphQL fails
  const displayProperties = properties.length > 0 ? properties : fallbackProperties;

  const handlePropertySelect = (property: Property) => {
    console.log(
      'PropertySelectionScreen: Navigating to PropertyDetails with propertyId:',
      property.id
    );
    console.log('PropertySelectionScreen: Full property object:', property);

    if (!property.id) {
      console.error('PropertySelectionScreen: Property has no ID!', property);
      Alert.alert('Error', 'Property ID not found. Please try again.');
      return;
    }

    try {
      console.log('PropertySelectionScreen: Attempting navigation with params:', {
        propertyId: property.id,
      });
      navigation.navigate('PropertyDetails', { propertyId: property.id });
      console.log('PropertySelectionScreen: Navigation successful');
    } catch (error) {
      console.error('PropertySelectionScreen: Navigation failed:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to property details. Please try again.');
    }
  };

  const renderProperty = ({ item }: { item: any }) => {
    // For now, show placeholder completion data since rooms aren't fetched
    // TODO: Update query to include rooms when server supports it
    const totalRooms = item.rooms?.length || 0;
    const completedRooms =
      item.rooms?.filter((room: any) => {
        const itemCount = room.items?.length || 0;
        const completedItemCount =
          room.items?.filter((item: any) => item.status === 'ACTIVE').length || 0;
        return itemCount > 0 && completedItemCount === itemCount;
      }).length || 0;
    const completionPercentage =
      totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;

    return (
      <Card style={styles.propertyCard} onPress={() => handlePropertySelect(item)}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/sample-property.png')}
            style={styles.propertyImage}
            resizeMode="cover"
          />
          {/* Completion overlay */}
          <View style={styles.completionOverlay}>
            <Chip
              mode="flat"
              textStyle={styles.completionChipText}
              style={[
                styles.completionChip,
                {
                  backgroundColor:
                    completionPercentage === 100
                      ? '#4caf50'
                      : completionPercentage > 50
                        ? '#ff9800'
                        : '#f44336',
                },
              ]}
            >
              {completionPercentage === 100 ? '✅ Complete' : `${completionPercentage}%`}
            </Chip>
          </View>
        </View>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.propertyName}>{item.name}</Title>
          <Paragraph style={styles.propertyAddress}>📍 {item.address}</Paragraph>
          {/* Note: description field doesn't exist in the current Property type */}
          {/* <Paragraph style={styles.propertyDescription}>{item.description}</Paragraph> */}

          {/* Completion progress section */}
          <View style={styles.completionSection}>
            <View style={styles.completionStats}>
              <Text variant="bodyMedium" style={styles.completionText}>
                🏠 {completedRooms}/{totalRooms} rooms completed
              </Text>
              <Text variant="bodySmall" style={styles.completionPercentage}>
                {completionPercentage}% complete
              </Text>
            </View>
            <ProgressBar
              progress={completionPercentage / 100}
              color={
                completionPercentage === 100
                  ? '#4caf50'
                  : completionPercentage > 50
                    ? '#ff9800'
                    : '#f44336'
              }
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    console.log('PropertySelectionScreen: Showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="headlineMedium" style={styles.loadingText}>
            Loading Properties...
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 10, color: '#666' }}>
            Debug: Loading from GraphQL...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={styles.errorText}>
            Error Loading Properties
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Failed to load properties. Please check your connection and try again.
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // No properties found
  if (displayProperties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={styles.emptyTitle}>
            No Properties Found
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Add some properties to get started with inventory validation
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
            Refresh
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          My Properties
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Select or scan a property to validate its inventory
        </Text>
        <Text variant="bodySmall" style={{ color: '#888', marginTop: 5 }}>
          Debug: GraphQL Data - {properties.length} properties, Loading: {loading.toString()},
          Error: {error ? 'Yes' : 'No'}
        </Text>
      </View>

      <FlatList
        data={displayProperties}
        renderItem={renderProperty}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.propertiesList}
        showsVerticalScrollIndicator={false}
      />
    </>
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
    lineHeight: 22,
  },
  propertiesList: {
    padding: 16,
  },
  propertyCard: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 20,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  propertyAddress: {
    color: '#666',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  propertyDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    alignItems: 'center',
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: '#333',
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 200,
    borderRadius: 16,
    paddingVertical: 12,
  },
  completionOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  completionChip: {
    borderRadius: 10,
  },
  completionChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completionSection: {
    marginTop: 15,
  },
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  completionText: {
    fontSize: 14,
    color: '#555',
  },
  completionPercentage: {
    fontSize: 12,
    color: '#888',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
