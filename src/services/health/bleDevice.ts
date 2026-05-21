import { Platform } from 'react-native';
import { useHealthDeviceStore } from '../../stores/useHealthDeviceStore';
import { useDashboardStore } from '../../stores/useDashboardStore';

export type BleScanDevice = { id: string; name: string };

const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

type BleManagerType = import('react-native-ble-plx').BleManager;
type DeviceType = import('react-native-ble-plx').Device;
type Subscription = import('react-native-ble-plx').Subscription;

let manager: BleManagerType | null = null;
let activeDevice: DeviceType | null = null;
let hrSubscription: Subscription | null = null;
const seenIds = new Set<string>();

function getManager(): BleManagerType {
  if (Platform.OS === 'web') {
    throw new Error('Bluetooth is not available on web.');
  }
  if (!manager) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BleManager } = require('react-native-ble-plx') as typeof import('react-native-ble-plx');
    manager = new BleManager();
  }
  return manager;
}

export function isBleSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function parseHeartRate(base64: string | null | undefined): number | null {
  if (!base64) return null;
  try {
    const raw = atob(base64);
    const flags = raw.charCodeAt(0);
    const rate16 = (flags & 0x01) !== 0;
    if (rate16 && raw.length >= 3) {
      return raw.charCodeAt(1) + (raw.charCodeAt(2) << 8);
    }
    if (raw.length >= 2) return raw.charCodeAt(1);
  } catch {
    return null;
  }
  return null;
}

function onHeartRate(bpm: number): void {
  useHealthDeviceStore.getState().setLastHeartRate(bpm);
  useHealthDeviceStore.getState().setLastSyncAt(new Date().toISOString());
  const clamped = Math.max(0, Math.min(100, Math.round((bpm / 180) * 100)));
  useDashboardStore.getState().setEnergyToday(clamped);
}

export async function scanHeartRateDevices(timeoutMs = 8000): Promise<BleScanDevice[]> {
  const ble = getManager();
  seenIds.clear();
  const found: BleScanDevice[] = [];

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ble.stopDeviceScan().catch(() => undefined);
      resolve(found);
    }, timeoutMs);

    ble.startDeviceScan(
      [HR_SERVICE],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          clearTimeout(timer);
          ble.stopDeviceScan().catch(() => undefined);
          reject(error);
          return;
        }
        if (!device || seenIds.has(device.id)) return;
        seenIds.add(device.id);
        found.push({
          id: device.id,
          name: device.name ?? device.localName ?? 'Heart rate device',
        });
      },
    );
  });
}

async function subscribeHeartRate(device: DeviceType): Promise<void> {
  const connected = await device.connect();
  await connected.discoverAllServicesAndCharacteristics();
  hrSubscription = connected.monitorCharacteristicForService(
    HR_SERVICE,
    HR_MEASUREMENT,
    (err, char) => {
      if (err) return;
      const bpm = parseHeartRate(char?.value);
      if (bpm != null && bpm > 0 && bpm < 250) onHeartRate(bpm);
    },
  );
  useHealthDeviceStore.getState().setConnected(true);
}

export async function connectHeartRateDevice(id: string, name: string): Promise<void> {
  await disconnectHeartRateDevice();
  const ble = getManager();
  const device = await ble.connectToDevice(id, { timeout: 12000 });
  activeDevice = device;
  useHealthDeviceStore.getState().setPairedDevice(id, name);
  await subscribeHeartRate(device);
}

export async function disconnectHeartRateDevice(): Promise<void> {
  hrSubscription?.remove();
  hrSubscription = null;
  if (activeDevice) {
    try {
      await activeDevice.cancelConnection();
    } catch {
      /* ignore */
    }
    activeDevice = null;
  }
  useHealthDeviceStore.getState().setConnected(false);
  useHealthDeviceStore.getState().clearPaired();
}

export async function reconnectPairedDevice(): Promise<void> {
  const { pairedDeviceId, pairedDeviceName } = useHealthDeviceStore.getState();
  if (!pairedDeviceId || !pairedDeviceName || !isBleSupported()) return;
  try {
    await connectHeartRateDevice(pairedDeviceId, pairedDeviceName);
  } catch {
    useHealthDeviceStore.getState().setConnected(false);
  }
}
