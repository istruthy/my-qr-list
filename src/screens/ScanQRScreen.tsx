import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getListById } from '../utils/storage';

type ScanQRScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ScanQR'>;
};

export const ScanQRScreen: React.FC<ScanQRScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Check if the QR code is from our app
    if (data.startsWith('myqrlist://list/')) {
      const listId = data.replace('myqrlist://list/', '');
      const list = await getListById(listId);
      
      if (list) {
        navigation.navigate('ViewList', { listId });
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go Back
        </Button>
      </View>
    );
  }

  // @ts-ignore - Camera component is valid but TypeScript doesn't recognize it
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>QR Code scanned!</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  camera: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 