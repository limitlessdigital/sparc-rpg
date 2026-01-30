// QR Code Scanner for Session Join
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Extract session code from URL or use raw code
    const match = data.match(/sparc:\/\/join\/([A-Z0-9]+)/) || 
                  data.match(/join\?code=([A-Z0-9]+)/) ||
                  data.match(/^([A-Z0-9]{6})$/);
    
    if (match) {
      onScan(match[1]);
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not a valid SPARC session code.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
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
        <Text style={styles.text}>Camera access is required to scan QR codes.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Scan Session QR Code</Text>
            <Pressable style={styles.closeIcon} onPress={onClose}>
              <Text style={styles.closeIconText}>✕</Text>
            </Pressable>
          </View>
          
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          
          <Text style={styles.hint}>
            Point your camera at a SPARC session QR code
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeIcon: {
    position: 'absolute',
    right: spacing.lg,
    padding: spacing.sm,
  },
  closeIconText: {
    fontSize: fontSizes.xxl,
    color: colors.text.primary,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.primary[500],
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  hint: {
    marginTop: spacing.xl,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  text: {
    fontSize: fontSizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.md,
  },
  closeButtonText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
});
