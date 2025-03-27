import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Button, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as Linking from 'expo-linking';

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

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    setScanned(true);

    if (mode === 'create') {
      // Call the callback with the scanned code and go back
      route.params?.onCodeScanned?.(data);
      navigation.goBack();
      return;
    }

    // Check if the scanned data is a valid URL for viewing
    if (data.startsWith('myqrlist://list/') || data.startsWith('exp://')) {
      const listId = data.split('/').pop() || '';
      navigation.replace('ViewList', { listId });
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
