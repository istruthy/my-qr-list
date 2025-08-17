import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
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
  const theme = useTheme();
  const mode = route.params?.mode || 'view';

  // Cleanup effect to reset scanned state and help prevent camera unmount issues
  useEffect(() => {
    return () => {
      setScanned(false);
      // Add any additional cleanup if needed
    };
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    setScanned(true);

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
      navigation.setParams({ scannedBarcode: data });
      navigation.goBack();
      return;
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
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
