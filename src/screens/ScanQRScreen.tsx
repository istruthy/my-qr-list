import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
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
  navigation: any; // Make navigation type more flexible
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanningError, setScanningError] = useState<string | null>(null);
  const theme = useTheme();
  const mode = route.params?.mode || 'view';

  console.log('[ScanQRScreen] mounted', { mode, params: route.params, permission });

  useEffect(() => {
    console.log('[ScanQRScreen] Component mounted, checking permissions...');
    if (!permission && !isRequestingPermission) {
      console.log('[ScanQRScreen] No permission, requesting...');
      setIsRequestingPermission(true);
      requestPermission()
        .then(() => {
          console.log('[ScanQRScreen] Permission request completed');
          setIsRequestingPermission(false);
        })
        .catch(error => {
          console.error('[ScanQRScreen] Permission request failed:', error);
          setIsRequestingPermission(false);
        });
    }
  }, [permission, requestPermission, isRequestingPermission]);

  const requestPermissionFallback = async () => {
    try {
      console.log('[ScanQRScreen] Requesting permission fallback...');
      const { status } = await requestPermission();
      console.log('[ScanQRScreen] Permission status:', status);
      if (status === 'granted') setIsRequestingPermission(false);
    } catch (error) {
      console.error('[ScanQRScreen] Permission error:', error);
    }
  };

  useEffect(() => {
    return () => setScanned(false);
  }, []);

  const handleBarCodeScanned = async ({ data, type }: BarcodeScanningResult) => {
    console.log('[ScanQRScreen] Barcode scanned:', { data, type, scanned });

    if (scanned) {
      console.log('[ScanQRScreen] Already scanned, ignoring');
      return;
    }

    setScanned(true);
    setScanningError(null);

    // Process the scanned data immediately without showing alert
    await processScannedData(data);
  };

  const processScannedData = async (data: string) => {
    try {
      console.log('[ScanQRScreen] Processing scanned data:', data);

      // Safety check for navigation
      if (!navigation || typeof navigation.navigate !== 'function') {
        console.error('[ScanQRScreen] Navigation not available');
        setScanningError('Navigation not available');
        setScanned(false);
        return;
      }

      // Smart routing based on QR code content
      if (data.startsWith('property-')) {
        const parts = data.split('-');
        if (parts.length >= 2) {
          const propertyId = parts[1];
          if (parts.length >= 4 && parts[2] === 'room') {
            const roomId = parts[3];
            // Navigate into nested Properties stack
            try {
              navigation.navigate('MainTabs', {
                screen: 'Properties',
                params: {
                  screen: 'RoomDetails',
                  params: { roomId, roomName: `Room ${roomId}`, propertyId },
                },
              });
              return;
            } catch (navError) {
              console.error('[ScanQRScreen] Navigation error for room:', navError);
              // Fallback: just go back
              if (typeof navigation.goBack === 'function') {
                navigation.goBack();
              }
              return;
            }
          }
          try {
            navigation.navigate('MainTabs', {
              screen: 'Properties',
              params: { screen: 'PropertyDetails', params: { propertyId } },
            });
            return;
          } catch (navError) {
            console.error('[ScanQRScreen] Navigation error for property:', navError);
            // Fallback: just go back
            if (typeof navigation.goBack === 'function') {
              navigation.goBack();
            }
            return;
          }
        }
      }

      if (mode === 'property' && route.params?.onPropertyScanned) {
        try {
          route.params.onPropertyScanned(data);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        } catch (callbackError) {
          console.error('[ScanQRScreen] Property callback error:', callbackError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }
      if (mode === 'room' && route.params?.onRoomScanned) {
        try {
          route.params.onRoomScanned(data);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        } catch (callbackError) {
          console.error('[ScanQRScreen] Room callback error:', callbackError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }
      if (mode === 'item' && route.params?.onItemScanned) {
        try {
          route.params.onItemScanned(data);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        } catch (callbackError) {
          console.error('[ScanQRScreen] Item callback error:', callbackError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }

      if (data.startsWith('myqrlist://list/') || data.startsWith('exp://')) {
        const listId = data.split('/').pop() || '';
        try {
          navigation.navigate('ViewList', { listId });
          return;
        } catch (navError) {
          console.error('[ScanQRScreen] Navigation error for list:', navError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }

      const existingList = await getListByBarcode(data);
      if (existingList) {
        try {
          navigation.navigate('ViewList', { listId: existingList.id });
          return;
        } catch (navError) {
          console.error('[ScanQRScreen] Navigation error for existing list:', navError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }

      if (mode === 'create') {
        try {
          navigation.navigate('CreateList', { scannedBarcode: data });
          return;
        } catch (navError) {
          console.error('[ScanQRScreen] Navigation error for create list:', navError);
          if (typeof navigation.goBack === 'function') {
            navigation.goBack();
          }
          return;
        }
      }

      // Default fallback
      if (typeof navigation.goBack === 'function') {
        navigation.goBack();
      } else {
        // If navigation is not available (e.g., in tab mode), show success message
        Alert.alert(
          'QR Code Scanned Successfully!',
          `Content: ${data}\n\nSince this is a tab screen, you can manually navigate to view the scanned content.`,
          [
            {
              text: 'Copy Content',
              onPress: () => {
                // In a real app, you'd copy to clipboard
                console.log('Scanned content to copy:', data);
                Alert.alert('Content Copied', 'Content copied to console. Check logs for details.');
                setScanned(false);
                setScanningError(null);
              },
            },
            {
              text: 'OK',
              onPress: () => {
                // Reset scanning state
                setScanned(false);
                setScanningError(null);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('[ScanQRScreen] Error processing scanned data:', error);
      setScanningError('Error processing scanned data');
      setScanned(false);
    }
  };

  const handleCameraReady = () => {
    console.log('[ScanQRScreen] Camera is ready');
    setIsCameraReady(true);
    setScanningError(null);
  };

  const handleCameraError = (error: any) => {
    console.error('[ScanQRScreen] Camera error:', error);
    console.error('[ScanQRScreen] Camera error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    setScanningError(`Camera error: ${error?.message || 'Unknown error'}`);
  };

  const resetScanning = () => {
    console.log('[ScanQRScreen] Resetting scanning state');
    setScanned(false);
    setScanningError(null);
  };

  // Essential logging for troubleshooting
  useEffect(() => {
    if (scanningError) {
      console.log('[ScanQRScreen] Error state:', scanningError);
    }
  }, [scanningError]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Requesting camera permission...</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Button mode="contained" onPress={requestPermissionFallback} style={styles.button}>
          Request Permission
        </Button>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Camera permission is not granted.</Text>
        <Button mode="contained" onPress={requestPermissionFallback} style={styles.button}>
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
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'ean13', 'code128'],
        }}
        onCameraReady={handleCameraReady}
        onMountError={handleCameraError}
      />

      {/* Camera overlay */}
      <View style={styles.overlay}>
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

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          {!isCameraReady && (
            <View style={styles.statusItem}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.statusText}>Initializing camera...</Text>
            </View>
          )}
          {scanningError && (
            <View style={styles.statusItem}>
              <Text style={[styles.statusText, styles.errorText]}>{scanningError}</Text>
              <Button mode="outlined" onPress={resetScanning} style={styles.retryButton}>
                Retry
              </Button>
            </View>
          )}
          {scanned && (
            <View style={styles.statusItem}>
              <Text style={[styles.statusText, styles.successText]}>QR Code detected!</Text>
            </View>
          )}

          {/* Scanning indicator */}
          {isCameraReady && !scanned && !scanningError && (
            <View style={styles.statusItem}>
              <ActivityIndicator size="small" color="#51cf66" />
              <Text style={[styles.statusText, styles.successText]}>Scanning for QR codes...</Text>
            </View>
          )}
        </View>

        {/* Bottom instructions */}
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            {scanned ? 'Processing...' : 'Align the QR code within the frame'}
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
          {scanned && (
            <Button mode="outlined" onPress={resetScanning} style={styles.button}>
              Scan Another
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    position: 'relative',
  },
  info: {
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  viewfinder: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
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
  statusContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statusItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#ff6b6b',
  },
  successText: {
    color: '#51cf66',
  },
  retryButton: {
    borderColor: '#fff',
    borderWidth: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  bottomText: {
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 16,
  },
});
