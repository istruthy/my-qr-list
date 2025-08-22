import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Alert,
  Pressable,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
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
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAccountContext } from '../contexts/AccountContext';
import { useProperties } from '../hooks/useGraphQL';
import { MainTabParamList, PropertiesStackParamList } from '../types';
import { Property } from '../graphql/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureFlagExample } from '../components/FeatureFlagExample';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8; // Slightly smaller to show part of next card
const CARD_SPACING = 16; // Space between cards

type PropertySelectionScreenProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Properties'>,
    NativeStackNavigationProp<PropertiesStackParamList>
  >;
};

export const PropertySelectionScreen: React.FC<PropertySelectionScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const scrollY = new Animated.Value(0);

  console.log('PropertySelectionScreen: Component rendering...');

  // Get account context
  const { currentAccountId, currentAccount, loading: accountLoading } = useAccountContext();

  // Dynamic header visibility based on scroll position
  useLayoutEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Show header when scrolling down, hide when at top
      const shouldShowHeader = value > 50;
      navigation.setOptions({
        headerShown: shouldShowHeader,
      });
    });

    // Initially hide the header
    navigation.setOptions({
      headerShown: false,
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [navigation, scrollY]);

  // Debug logging for account context
  console.log('PropertySelectionScreen: Account Context Debug:');
  console.log('  - currentAccountId:', currentAccountId);
  console.log('  - currentAccount:', currentAccount);
  console.log('  - accountLoading:', accountLoading);

  // GraphQL query to fetch properties for the current account
  const { data, loading, error, refetch } = useProperties();

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Automatically refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('PropertySelectionScreen: Screen focused, refetching properties...');
      if (currentAccountId) {
        refetch();
      }
    }, [refetch, currentAccountId])
  );

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    console.log('PropertySelectionScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    if (currentAccountId) {
      try {
        await refetch();
        // Add a small delay to show the refresh indicator
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        setRefreshing(false);
      }
    } else {
      setRefreshing(false);
    }
  }, [refetch, currentAccountId]);

  // Extract properties from GraphQL response
  const properties = data?.properties || [];
  console.log('PropertySelectionScreen: Fetched properties from GraphQL:', properties);
  console.log('PropertySelectionScreen: Properties count:', properties.length);
  console.log('PropertySelectionScreen: Loading state:', loading);
  console.log('PropertySelectionScreen: Error state:', error);
  console.log('PropertySelectionScreen: Raw data:', data);

  // Use GraphQL properties directly
  const displayProperties = properties;

  // Add placeholder cards if we have less than 5 properties to ensure scroll animation works
  const getDisplayProperties = () => {
    if (properties.length >= 5) {
      return properties;
    }

    // Create placeholder properties for testing scroll animation
    const placeholders = [];
    const placeholderCount = 5 - properties.length;

    for (let i = 0; i < placeholderCount; i++) {
      placeholders.push({
        id: `placeholder-${i}`,
        name: `Sample Property ${i + 1}`,
        address: `${100 + i} Sample Street`,
        description: `This is a placeholder property for testing scroll animations`,
        barcode: `PLACE${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lists: [
          {
            id: `placeholder-list-${i}`,
            name: `Sample List ${i + 1}`,
            items: [
              { id: `placeholder-item-${i}-1`, isCompleted: false },
              { id: `placeholder-item-${i}-2`, isCompleted: true },
              { id: `placeholder-item-${i}-3`, isCompleted: false },
            ],
          },
        ],
      });
    }

    return [...properties, ...placeholders];
  };

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
      navigation.navigate('PropertyDetails', {
        propertyId: property.id,
        propertyName: property.name,
      });
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
      <Pressable onPress={() => handlePropertySelect(item)}>
        <Card style={[styles.propertyCard, { width: CARD_WIDTH }]} key={item.id}>
          {/* Property Image with Completion Chip Overlay */}
          <View style={styles.imageContainer}>
            <Card.Cover
              source={require('../../assets/sample-property.png')}
              style={styles.propertyImage}
              resizeMode="cover"
            />
            {/* Completion Chip Overlay */}
            <View style={styles.completionChipOverlay}>
              <Chip
                mode="outlined"
                textStyle={styles.overlayChipText}
                style={[
                  styles.overlayCompletionChip,
                  {
                    backgroundColor: overallCompleted
                      ? theme.colors.primaryContainer
                      : 'rgba(255, 255, 255, 0.9)',
                  },
                ]}
              >
                {overallPercentage}%
              </Chip>
            </View>
          </View>

          <Card.Content style={{ justifyContent: 'space-between', height: 200 }}>
            <View id="property-info">
              <Text style={{ marginTop: 10 }} variant="titleLarge">
                {item.name}
              </Text>
              <Text variant="bodyMedium">{item.address}</Text>

              {item.description && <Text variant="bodyMedium">{item.description}</Text>}
            </View>

            <View id="completion-section" style={styles.completionSection}>
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
          </Card.Content>

          {/* <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handlePropertySelect(item)}
            style={styles.selectButton}
            labelStyle={styles.buttonLabel}
          >
            View Property
          </Button>
        </Card.Actions> */}
        </Card>
      </Pressable>
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
      {/* Dynamic Welcome Header - disappears when scrolling */}
      <Animated.View
        style={[
          styles.welcomeHeader,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, -120],
                  extrapolate: 'clamp',
                }),
              },
            ],
            opacity: scrollY.interpolate({
              inputRange: [0, 80],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <View style={styles.welcomeHeaderContent}>
          <Text style={styles.welcomeTitle}>innventry</Text>
          <Text style={styles.welcomeSubtitle}>
            Scan a property QR code or select a property to begin
          </Text>
          {refreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.refreshText}>Refreshing...</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Scrollable Content Container */}
      <ScrollView
        style={styles.scrollContainer}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={8}
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Horizontal Property Cards */}
        <FlatList
          data={getDisplayProperties()}
          horizontal={true}
          renderItem={renderProperty}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          snapToAlignment="start"
          scrollEnabled={true} // Disable horizontal scroll since we're in ScrollView
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH + CARD_SPACING,
            offset: (CARD_WIDTH + CARD_SPACING) * index,
            index,
          })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No properties found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first property to get started
              </Text>
            </View>
          }
        />

        {/* Placeholder content to make screen scrollable */}
        <View style={styles.placeholderContent}>
          {/* Add some placeholder cards for visual content */}
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.placeholderCard}>
              <Text style={styles.placeholderCardTitle}>Placeholder Card {index + 1}</Text>
              <Text style={styles.placeholderCardText}>
                This is additional content to make the screen scrollable and demonstrate the header
                animation.
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    // alignItems: 'center',
  },
  welcomeHeaderContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    lineHeight: 18,
    marginRight: 70,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#333',
  },
  blueHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  blueHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholderContent: {
    padding: 20,
    paddingTop: 0, // Reduced space for the horizontal cards
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  placeholderCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholderCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderCardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 170, // Reduced space for the welcome header
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  propertyCard: {
    marginRight: CARD_SPACING,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: 400, // Fixed height for consistent card appearance
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200, // Increased height for better proportion
  },
  propertyImage: {
    height: '100%',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  completionChipOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  overlayCompletionChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  overlayChipText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
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
