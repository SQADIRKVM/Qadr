import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../primitives/AppText';
import { spacing } from '../../theme/spacing';
import { hapticLight } from '../../utils/haptics';
import { glassModalSurface } from '../../theme/glass';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';
import {
  isBleSupported,
  scanHeartRateDevices,
  connectHeartRateDevice,
  disconnectHeartRateDevice,
  type BleScanDevice,
} from '../../services/health/bleDevice';
import { useHealthDeviceStore } from '../../stores/useHealthDeviceStore';
import { userAlert } from '../../utils/userAlert';

export const BioSyncDeviceRow: React.FC = () => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const supported = isBleSupported();
  const pairedName = useHealthDeviceStore((s) => s.pairedDeviceName);
  const connected = useHealthDeviceStore((s) => s.connected);
  const lastHeartRate = useHealthDeviceStore((s) => s.lastHeartRate);

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [devices, setDevices] = React.useState<BleScanDevice[]>([]);
  const [connecting, setConnecting] = React.useState(false);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopScan = useCallback(() => {
    if (scanTimer.current) clearTimeout(scanTimer.current);
    setScanning(false);
  }, []);

  const openPicker = async () => {
    if (!supported) {
      userAlert(
        'Bluetooth health device',
        'Connect a heart rate monitor from the Qadr iOS or Android app. Web does not support Bluetooth pairing yet.',
      );
      return;
    }
    setPickerOpen(true);
    setScanning(true);
    setDevices([]);
    try {
      const found = await scanHeartRateDevices(8000);
      setDevices(found);
    } catch (e) {
      userAlert(
        'Scan failed',
        e instanceof Error ? e.message : 'Enable Bluetooth and try again.',
      );
    } finally {
      setScanning(false);
    }
  };

  const pickDevice = async (device: BleScanDevice) => {
    setConnecting(true);
    try {
      await connectHeartRateDevice(device.id, device.name);
      setPickerOpen(false);
      stopScan();
    } catch (e) {
      userAlert(
        'Connection failed',
        e instanceof Error ? e.message : 'Could not connect to this device.',
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectHeartRateDevice();
    } catch {
      /* ignore */
    }
  };

  const statusLabel = !supported
    ? 'Use mobile app to connect'
    : pairedName
      ? connected
        ? lastHeartRate != null
          ? `${pairedName} · ${lastHeartRate} bpm`
          : pairedName
        : `${pairedName} · offline`
      : 'No accessory paired';

  return (
    <>
      <View style={styles.wrap}>
        <AppText variant="label-sm" style={styles.label}>
          Health device (Bluetooth)
        </AppText>
        <Pressable
          onPress={() => {
            hapticLight();
            if (pairedName && supported) {
              void handleDisconnect();
            } else {
              void openPicker();
            }
          }}
          disabled={connecting}
          style={({ pressed }) => [styles.field, pressed && styles.pressed]}
        >
          <AppText variant="body-md" style={styles.value} numberOfLines={1}>
            {statusLabel}
          </AppText>
          <View
            style={[
              styles.dot,
              connected && supported ? styles.dotOn : styles.dotOff,
            ]}
          />
          {supported ? (
            <MaterialIcons
              name={pairedName ? 'link-off' : 'bluetooth-searching'}
              size={22}
              color={colors.onSurfaceVariant}
            />
          ) : (
            <MaterialIcons name="info-outline" size={22} color={colors.onSurfaceVariant} />
          )}
        </Pressable>
        {!supported && Platform.OS === 'web' ? (
          <AppText variant="body-md" muted style={styles.hint}>
            Pair a Bluetooth heart rate monitor in the iOS or Android build.
          </AppText>
        ) : null}
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => { setPickerOpen(false); stopScan(); }}>
          <Pressable style={[styles.sheet, glassModalSurface(colors)]} onPress={(e) => e.stopPropagation()}>
            <AppText variant="headline-md" style={styles.sheetTitle}>
              Nearby devices
            </AppText>
            <AppText variant="body-md" muted style={styles.sheetSub}>
              Heart rate accessories advertising BLE GATT service 0x180D
            </AppText>
            {scanning ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : null}
            <FlatList
              data={devices}
              keyExtractor={(d) => d.id}
              style={styles.list}
              ListEmptyComponent={
                !scanning ? (
                  <AppText variant="body-md" muted style={styles.empty}>
                    No devices found. Turn on your band and try again.
                  </AppText>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.deviceRow, pressed && styles.pressed]}
                  onPress={() => void pickDevice(item)}
                  disabled={connecting}
                >
                  <AppText variant="body-md">{item.name}</AppText>
                  <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                </Pressable>
              )}
            />
            <Pressable
              onPress={() => { setPickerOpen(false); stopScan(); }}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
            >
              <AppText variant="label-sm" style={styles.cancelLabel}>
                Cancel
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: { gap: 8 },
    label: {
      color: colors.onSurfaceVariant,
      letterSpacing: 0.2,
      textTransform: 'none',
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceContainer,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.sm,
      paddingVertical: 10,
      gap: 12,
    },
    pressed: { opacity: 0.85 },
    value: { flex: 1, color: colors.onSurface },
    dot: { width: 8, height: 8, borderRadius: 4 },
    dotOn: { backgroundColor: colors.dotGreen },
    dotOff: { backgroundColor: colors.accentRed },
    hint: { lineHeight: 20 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
      padding: spacing.md,
    },
    sheet: {
      borderRadius: spacing.cardRadius,
      padding: spacing.md,
      maxHeight: '70%',
    },
    sheetTitle: { color: colors.onSurface, marginBottom: 4 },
    sheetSub: { marginBottom: spacing.sm },
    loader: { marginVertical: spacing.md },
    list: { maxHeight: 280 },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    empty: { paddingVertical: spacing.md, textAlign: 'center' },
    cancelBtn: {
      marginTop: spacing.sm,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelLabel: { color: colors.onSurfaceVariant, letterSpacing: 1 },
  });
