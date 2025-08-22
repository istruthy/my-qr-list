import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { RootStackParamList } from '../types';
import { ActionButton } from '../components/ActionButton';
import { useAuth } from '../hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_SPACING = 16;
const CARD_OFFSET = (screenWidth - CARD_WIDTH) / 2;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

// Separate component for animated cards to avoid hooks violation
const CarouselCard: React.FC<{
  title: string;
  subtitle: string;
  barcode?: string;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}> = ({ title, subtitle, barcode, index, scrollX, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const input = scrollX.value;
    const translateX = input - (CARD_WIDTH + CARD_SPACING) * index;

    const scale = interpolate(
      translateX,
      [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      translateX,
      [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View key={index} style={[styles.cardContainer, animatedStyle]}>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          {barcode && <Text style={styles.barcodeText}>Barcode: {barcode}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, currentAccount } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Mock data for now - will be replaced with GraphQL data
  const mockProperties = [
    { id: '1', name: 'My House', address: 'In the middle of the street', barcode: undefined },
    { id: '2', name: 'Island Condo', address: '3 Ocean View', barcode: 'kitchen-002' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement GraphQL search
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderCarousel = () => {
    const data = mockProperties;

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No properties yet</Text>
          <Text style={styles.emptyStateSubtitle}>Create your first property to get started</Text>
        </View>
      );
    }

    return (
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {data.map((property, index) => (
          <CarouselCard
            key={property.id}
            title={property.name}
            subtitle={property.address}
            barcode={property.barcode}
            index={index}
            scrollX={scrollX}
            onPress={() => {
              navigation.navigate('MainTabs', {
                screen: 'Properties',
                params: {
                  screen: 'PropertyDetails',
                  params: { propertyId: property.id },
                },
              });
            }}
          />
        ))}
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back, {user?.name || 'User'}!</Text>
        {currentAccount && <Text style={styles.subtitle}>Account: {currentAccount.name}</Text>}
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>Search Properties</Text>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Properties',
              params: { screen: 'PropertySelection' },
            })
          }
        >
          <Text style={styles.searchPlaceholder}>Tap to search properties...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrapper}>{renderCarousel()}</View>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <ActionButton label="Scan QR Code" onPress={() => navigation.navigate('ScanQR')} />
        <ActionButton
          label="View All Properties"
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'Properties',
              params: { screen: 'PropertySelection' },
            })
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchPlaceholder: {
    color: '#888',
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContainer: {
    paddingHorizontal: CARD_OFFSET,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  card: {
    height: 160,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#007bff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
  },
  footer: {
    paddingTop: 8,
  },
});
