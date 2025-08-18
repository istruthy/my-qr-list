import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult, Camera } from 'expo-camera';
import { Button, useTheme } from 'react-native-paper';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types';
import * as Linking from 'expo-linking';
import { getListByBarcode } from '../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(screenWidth * 0.72, 280);

type ScanQRScreenProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Scan'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
  route: {
    params?: {
      mode?: 'view' | 'create' | 'property' | 'room' | 'item';
      scannedBarcode?: string;
      propertyId?: string;
      roomId?: string;
      onPropertyScanned?: (propertyId: string) => void;
      onRoomScanned?: (roomId: string) => void;
      onItemScanned?: (itemId: string) => void;
    };
  };
};

export const ScanQRScreen: React.FC<ScanQRScreenProps> = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const theme = useTheme();
  const mode = route.params?.mode || 'view';

  console.log('[ScanQRScreen] mounted', { mode, params: route.params, permission });

  useEffect(() => {
    if (!permission && !isRequestingPermission) {
      setIsRequestingPermission(true);
      requestPermission()
        .then(() => setIsRequestingPermission(false))
        .catch(() => setIsRequestingPermission(false));
    }
  }, [permission, requestPermission, isRequestingPermission]);

  const requestPermissionFallback = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') setIsRequestingPermission(false);
    } catch {}
  };

  useEffect(() => {
    return () => setScanned(false);
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setTimeout(() => setScanned(false), 2000);

    // Smart routing based on QR code content
    if (data.startsWith('property-')) {
      const parts = data.split('-');
      if (parts.length >= 2) {
        const propertyId = parts[1];
        if (parts.length >= 4 && parts[2] === 'room') {
          const roomId = parts[3];
          // Navigate into nested Properties stack
          navigation.getParent()?.navigate('MainTabs', {
            screen: 'Properties',
            params: {
              screen: 'RoomDetails',
              params: { roomId, roomName: `Room ${roomId}`, propertyId },
            },
          });
          return;
        }
        navigation.getParent()?.navigate('MainTabs', {
          screen: 'Properties',
          params: { screen: 'PropertyDetails', params: { propertyId } },
        });
        return;
      }
    }

    if (mode === 'property' && route.params?.onPropertyScanned) {
      route.params.onPropertyScanned(data);
      navigation.goBack();
      return;
    }
    if (mode === 'room' && route.params?.onRoomScanned) {
      route.params.onRoomScanned(data);
      navigation.goBack();
      return;
    }
    if (mode === 'item' && route.params?.onItemScanned) {
      route.params.onItemScanned(data);
      navigation.goBack();
      return;
    }

    if (data.startsWith('myqrlist://list/') || data.startsWith('exp://')) {
      const listId = data.split('/').pop() || '';
      navigation.navigate('ViewList', { listId });
      return;
    }

    const existingList = await getListByBarcode(data);
    if (existingList) {
      navigation.navigate('ViewList', { listId: existingList.id });
      return;
    }

    if (mode === 'create') {
      navigation.navigate('CreateList', { scannedBarcode: data });
      return;
    }

    navigation.goBack();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Requesting camera permission...</Text>
        <Button mode="contained" onPress={requestPermissionFallback}>
          Request Permission
        </Button>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Camera permission is not granted.</Text>
        <Button mode="contained" onPress={requestPermissionFallback}>
          Grant Permission
        </Button>
      </View>
    );
  }

  const verticalMaskHeight = (screenHeight - VIEWFINDER_SIZE) / 2;
  const horizontalMaskWidth = (screenWidth - VIEWFINDER_SIZE) / 2;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417', 'ean13', 'code128'] }}
      />

      {/* Dimmed mask overlays */}
      <View style={[styles.mask, { top: 0, height: verticalMaskHeight }]} />
      <View style={[styles.mask, { bottom: 0, height: verticalMaskHeight }]} />
      <View
        style={[
          styles.mask,
          {
            top: verticalMaskHeight,
            bottom: verticalMaskHeight,
            left: 0,
            width: horizontalMaskWidth,
          },
        ]}
      />
      <View
        style={[
          styles.mask,
          {
            top: verticalMaskHeight,
            bottom: verticalMaskHeight,
            right: 0,
            width: horizontalMaskWidth,
          },
        ]}
      />

      {/* Centered viewfinder */}
      <View
        style={[
          styles.viewfinder,
          {
            width: VIEWFINDER_SIZE,
            height: VIEWFINDER_SIZE,
            top: verticalMaskHeight,
            left: horizontalMaskWidth,
          },
        ]}
      >
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Bottom instructions */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>Align the QR code within the frame</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Cancel
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  info: { color: '#333' },
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  viewfinder: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#fff',
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },
  bottomText: { color: 'white', marginBottom: 4 },
});
