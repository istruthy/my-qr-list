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
import { useAccountContext } from '../contexts/AccountContext';
import { useProperties } from '../hooks/useGraphQL';
import { MainTabParamList, PropertiesStackParamList } from '../types';
import { Property } from '../graphql/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureFlagExample } from '../components/FeatureFlagExample';

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

  // Get account context
  const { currentAccountId, currentAccount, loading: accountLoading } = useAccountContext();

  // Debug logging for account context
  console.log('PropertySelectionScreen: Account Context Debug:');
  console.log('  - currentAccountId:', currentAccountId);
  console.log('  - currentAccount:', currentAccount);
  console.log('  - accountLoading:', accountLoading);

  // GraphQL query to fetch properties for the current account
  const { data, loading, error, refetch } = useProperties();

  // Extract properties from GraphQL response
  const properties = data?.properties || [];
  console.log('PropertySelectionScreen: Fetched properties from GraphQL:', properties);
  console.log('PropertySelectionScreen: Properties count:', properties.length);
  console.log('PropertySelectionScreen: Loading state:', loading);
  console.log('PropertySelectionScreen: Error state:', error);
  console.log('PropertySelectionScreen: Raw data:', data);

  // Use GraphQL properties directly
  const displayProperties = properties;

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

  const renderProperty = ({ item }: { item: Property }) => {
    // Calculate completion percentage using the GraphQL data
    const lists = item.lists || [];
    const totalLists = lists.length;

    // Calculate completion for each list based on its items
    const listCompletions = lists.map((list: any) => {
      const items = list.items || [];
      const totalItems = items.length;

      if (totalItems === 0) return { completed: false, percentage: 0 };

      const completedItems = items.filter((item: any) => item.isCompleted === true).length;
      const percentage = Math.round((completedItems / totalItems) * 100);
      const completed = completedItems === totalItems;

      return { completed, percentage };
    });

    // Calculate overall completion
    const totalItems = lists.reduce((sum: number, list: any) => {
      return sum + (list.items?.length || 0);
    }, 0);

    const completedItems = lists.reduce((sum: number, list: any) => {
      return sum + (list.items?.filter((item: any) => item.isCompleted)?.length || 0);
    }, 0);

    const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const overallCompleted = totalItems > 0 && completedItems === totalItems;

    return (
      <Card style={[styles.propertyCard, { width: CARD_WIDTH }]} key={item.id}>
        <Card.Content>
          <Text variant="titleLarge">{item.name}</Text>
          <Text variant="bodyMedium">{item.address}</Text>

          {item.description && <Text variant="bodyMedium">{item.description}</Text>}

          <View style={styles.completionSection}>
            <Text style={styles.completionLabel}>Overall Progress</Text>
            <ProgressBar
              progress={overallPercentage / 100}
              color={overallCompleted ? theme.colors.primary : theme.colors.secondary}
              style={styles.progressBar}
            />
            <Text style={styles.completionText}>
              {completedItems} of {totalItems} items completed ({overallPercentage}%)
            </Text>
          </View>

          {totalLists > 0 && (
            <View style={styles.listsSection}>
              <Text style={styles.listsLabel}>Lists ({totalLists})</Text>
              {lists.map((list: any, index: number) => (
                <View key={list.id} style={styles.listItem}>
                  <Text style={styles.listName}>{list.name}</Text>
                  <Chip
                    mode="outlined"
                    textStyle={styles.chipText}
                    style={[
                      styles.completionChip,
                      {
                        backgroundColor: listCompletions[index]?.completed
                          ? theme.colors.primaryContainer
                          : 'transparent',
                      },
                    ]}
                  >
                    {listCompletions[index]?.percentage || 0}%
                  </Chip>
                </View>
              ))}
            </View>
          )}

          <View style={styles.propertyMeta}>
            <Text style={styles.propertyDate}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.barcode && <Text style={styles.propertyBarcode}>Barcode: {item.barcode}</Text>}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handlePropertySelect(item)}
            style={styles.selectButton}
            labelStyle={styles.buttonLabel}
          >
            Select Property
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Show loading state while account context is loading
  if (accountLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no account context
  if (!currentAccountId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No account available</Text>
          <Text style={styles.errorSubtext}>Please ensure you have access to an account</Text>

          {/* Debug information */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Debug Information:</Text>
            <Text style={styles.debugText}>
              • Current Account ID: {currentAccountId || 'Not set'}
            </Text>
            <Text style={styles.debugText}>
              • Current Account Name: {currentAccount?.name || 'Not loaded'}
            </Text>
            <Text style={styles.debugText}>• Account Loading: {accountLoading ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>• Properties Loading: {loading ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>• Properties Count: {properties.length}</Text>
          </View>

          <Button
            onPress={() => {
              console.log('PropertySelectionScreen: Manual refresh requested');
              refetch();
            }}
            style={styles.retryButton}
          >
            Refresh Properties
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Error loading properties</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
          <Button onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {/* <View style={styles.header}>
        <Title style={styles.headerTitle}>Select a Property</Title>
        {currentAccount && <Text style={styles.accountName}>{currentAccount.name}</Text>}
        <Text style={styles.headerSubtitle}>
          {properties.length} property{properties.length !== 1 ? 's' : ''} found
        </Text>
      </View> */}

      <FlatList
        data={displayProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No properties found</Text>
            <Text style={styles.emptyStateSubtext}>Create your first property to get started</Text>
          </View>
        }
      />

      {/* <FeatureFlagExample /> */}

      {/* <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // TODO: Navigate to create property screen when implemented
          Alert.alert('Coming Soon', 'Create property functionality will be available soon!');
        }}
      /> */}
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
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  accountName: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#666',
    lineHeight: 22,
  },
  listContainer: {
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
  propertyTitle: {
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
  completionSection: {
    marginTop: 15,
  },
  completionLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#555',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  listsSection: {
    marginTop: 15,
  },
  listsLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  chipText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completionChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  propertyMeta: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyDate: {
    fontSize: 14,
    color: '#888',
  },
  propertyBarcode: {
    fontSize: 14,
    color: '#888',
  },
  cardActions: {
    alignItems: 'center',
  },
  selectButton: {
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 200,
    flex: 1,
  },
  buttonLabel: {
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
  },
  errorSubtext: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#333',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  debugText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
