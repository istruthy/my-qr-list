import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as Linking from 'expo-linking';

type ScanQRScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScanQR'>;
};

export const ScanQRScreen: React.FC<ScanQRScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const theme = useTheme();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    
    // Check if the scanned data is a valid URL
    if (data.startsWith('myqrlist://list/') || data.startsWith('exp://')) {
      const listId = data.split('/').pop() || '';
      navigation.replace('ViewList', { listId });
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.button}
        >
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
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          {scanned && (
            <View style={styles.scannedOverlay}>
              <Text style={styles.scannedText}>QR Code Scanned!</Text>
              <Button
                mode="contained"
                onPress={() => setScanned(false)}
                style={styles.button}
              >
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
  button: {
    marginTop: 20,
  },
}); 