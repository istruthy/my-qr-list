import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Image } from 'react-native';
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
} from 'react-native-paper';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, PropertiesStackParamList } from '../types';
import { getPropertiesByUserId } from '../db/services';
import { Property, PropertyWithCompletion } from '../db/schema';
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
  const [properties, setProperties] = useState<PropertyWithCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      // TODO: Load from database when ready
      // For now, using mock data with placeholder images and completion data
      const mockProperties: PropertyWithCompletion[] = [
        {
          id: '1',
          name: 'Sunset Villa',
          address: '123 Ocean Drive, Malibu, CA',
          description: 'Luxurious beachfront property with stunning ocean views',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lists: [],
          totalRooms: 5,
          completedRooms: 3,
          completionPercentage: 60,
        },
        {
          id: '2',
          name: 'Mountain Lodge',
          address: '456 Pine Ridge, Aspen, CO',
          description: 'Cozy mountain retreat surrounded by pine forests',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lists: [],
          totalRooms: 3,
          completedRooms: 3,
          completionPercentage: 100,
        },
        {
          id: '3',
          name: 'Urban Loft',
          address: '789 Downtown Ave, New York, NY',
          description: 'Modern city apartment with industrial chic design',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lists: [],
          totalRooms: 4,
          completedRooms: 0,
          completionPercentage: 0,
        },
        {
          id: '4',
          name: 'Country Estate',
          address: '321 Farm Road, Napa Valley, CA',
          description: 'Sprawling vineyard estate with rustic charm',
          userId: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lists: [],
          totalRooms: 8,
          completedRooms: 6,
          completionPercentage: 75,
        },
      ];

      setProperties(mockProperties);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading properties:', error);
      setIsLoading(false);
    }
  };

  const handlePropertySelect = (property: PropertyWithCompletion) => {
    navigation.navigate('PropertyDetails', { propertyId: property.id });
  };

  const renderProperty = ({ item }: { item: PropertyWithCompletion }) => (
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
                  item.completionPercentage === 100
                    ? '#4caf50'
                    : item.completionPercentage > 50
                      ? '#ff9800'
                      : '#f44336',
              },
            ]}
          >
            {item.completionPercentage === 100 ? '✅ Complete' : `${item.completionPercentage}%`}
          </Chip>
        </View>
      </View>
      <Card.Content style={styles.cardContent}>
        <Title style={styles.propertyName}>{item.name}</Title>
        <Paragraph style={styles.propertyAddress}>📍 {item.address}</Paragraph>
        <Paragraph style={styles.propertyDescription}>{item.description}</Paragraph>

        {/* Completion progress section */}
        <View style={styles.completionSection}>
          <View style={styles.completionStats}>
            <Text variant="bodyMedium" style={styles.completionText}>
              🏠 {item.completedRooms}/{item.totalRooms} rooms completed
            </Text>
            <Text variant="bodySmall" style={styles.completionPercentage}>
              {item.completionPercentage}% complete
            </Text>
          </View>
          <ProgressBar
            progress={item.completionPercentage / 100}
            color={
              item.completionPercentage === 100
                ? '#4caf50'
                : item.completionPercentage > 50
                  ? '#ff9800'
                  : '#f44336'
            }
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="headlineMedium">Loading Properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (properties.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium">No Properties Found</Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Add some properties to get started with inventory validation
          </Text>
          <Button mode="contained" onPress={loadProperties} style={styles.retryButton}>
            Retry
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
      </View>

      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
