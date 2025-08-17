import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult, Camera } from 'expo-camera';
import { Button, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as Linking from 'expo-linking';
import { getListByBarcode } from '../utils/storage';

type ScanQRScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScanQR'>;
  route: {
    params?: {
      mode?: 'view' | 'create';
      onCodeScanned?: (code: string) => void;
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

  // Request permission on mount if not already granted
  useEffect(() => {
    console.log('[ScanQRScreen] useEffect triggered, permission state:', permission);
    if (!permission && !isRequestingPermission) {
      console.log('[ScanQRScreen] Requesting camera permission on mount');
      setIsRequestingPermission(true);
      requestPermission()
        .then(result => {
          console.log('[ScanQRScreen] Permission request result:', result);
          setIsRequestingPermission(false);
        })
        .catch(error => {
          console.error('[ScanQRScreen] Permission request error:', error);
          setIsRequestingPermission(false);
        });
    }
  }, [permission, requestPermission, isRequestingPermission]);

  // Fallback permission request function
  const requestPermissionFallback = async () => {
    try {
      console.log('[ScanQRScreen] Using fallback permission request');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('[ScanQRScreen] Fallback permission result:', status);
      if (status === 'granted') {
        // Force a re-render by updating state
        setIsRequestingPermission(false);
      }
    } catch (error) {
      console.error('[ScanQRScreen] Fallback permission error:', error);
    }
  };

  // Cleanup effect to reset scanned state and help prevent camera unmount issues
  useEffect(() => {
    return () => {
      setScanned(false);
      // Add any additional cleanup if needed
    };
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) {
      console.log('[ScanQRScreen] Ignoring repeated scan', { data, mode });
      return;
    }
    setScanned(true);
    // Extra protection: disable further scans for 2s
    setTimeout(() => setScanned(false), 2000);
    console.log('[ScanQRScreen] Barcode scanned', { data, mode });

    // First check if this is a valid URL for viewing
    if (data.startsWith('myqrlist://list/') || data.startsWith('exp://')) {
      const listId = data.split('/').pop() || '';
      navigation.replace('ViewList', { listId });
      return;
    }

    // Check if this barcode is already associated with a list
    const existingList = await getListByBarcode(data);
    if (existingList) {
      navigation.replace('ViewList', { listId: existingList.id });
      return;
    }

    // If we're in create mode and the barcode isn't associated with a list,
    // pass the scanned barcode back using navigation params
    if (mode === 'create') {
      // Show success feedback first
      console.log('[ScanQRScreen] Barcode scanned in create mode:', data);

      // Navigate back with the scanned barcode as a parameter
      console.log('[ScanQRScreen] Replacing CreateList with barcode:', data);
      navigation.replace('CreateList', { scannedBarcode: data });
      return;
    }
  };

  // Handle different permission states
  if (isRequestingPermission) {
    console.log('[ScanQRScreen] Requesting camera permission...');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission) {
    console.log('[ScanQRScreen] No permission object, requesting permission...');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not available</Text>
        <Button mode="contained" onPress={requestPermissionFallback} style={styles.button}>
          Request Permission (Fallback)
        </Button>
      </View>
    );
  }

  if (!permission.granted) {
    console.log('[ScanQRScreen] Permission not granted, showing request button');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required to scan QR codes</Text>
        <Button mode="contained" onPress={requestPermissionFallback} style={styles.button}>
          Grant Permission (Fallback)
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={[styles.camera, scanned ? { display: 'none' } : {}]}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes:
            mode === 'create' ? ['qr', 'ean8', 'ean13', 'code39', 'code128', 'upc_a'] : ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.headerText}>
            {mode === 'create' ? 'Scan Barcode or QR Code' : 'Scan QR Code'}
          </Text>
          <View style={styles.scanArea} />
          <Text style={styles.instructionText}>
            {mode === 'create'
              ? 'Position the barcode or QR code within the frame'
              : 'Position the QR code within the frame'}
          </Text>
          {scanned && (
            <View style={styles.scannedOverlay}>
              <Text style={styles.scannedText}>Code Scanned!</Text>
              <Button mode="contained" onPress={() => setScanned(false)} style={styles.button}>
                Scan Again
              </Button>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  scannedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  button: {
    marginTop: 20,
  },
});
