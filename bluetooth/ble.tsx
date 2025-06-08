import { Buffer } from 'buffer';
import { useCallback, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const SENSOR_PACKET1_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"; // Temp, Humi, Cond
const SENSOR_PACKET2_UUID = "19b10002-e8f2-537e-4f6c-d104768a1214"; // pH, N, P, K

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  connectedDeviceName: string | null;
  allDevices: Device[];
  humi: number;
  temp: number;
  cond: number;
  ph: number;
  nitro: number;
  phos: number;
  pota: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [humi, setHumi] = useState<number>(0);
  const [temp, setTemp] = useState<number>(0);
  const [cond, setCond] = useState<number>(0);
  const [ph, setPh] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(0);
  const [phos, setPhos] = useState<number>(0);
  const [pota, setPota] = useState<number>(0);
  
  // Estados para almacenar paquetes parciales
  const [packet1Data, setPacket1Data] = useState<string>("");
  const [packet2Data, setPacket2Data] = useState<string>("");
  
  // Referencias para debouncing
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted = await requestAndroid31Permissions();
        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        alert(error)
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      setConnectedDeviceName(device.name || device.localName || "tamachi");
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
      alert(e)
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setConnectedDeviceName(null);
      setHumi(0);
      setTemp(0);
      setCond(0);
      setPh(0);
      setNitro(0);
      setPhos(0);
      setPota(0);
      setPacket1Data("");
      setPacket2Data("");
      
      // Limpiar timeout si existe
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      lastUpdateRef.current = 0;
    }
  };

  const processCompleteData = useCallback((packet1: string, packet2: string) => {
    const now = Date.now();
    // Debounce: solo procesar si han pasado al menos 500ms desde la última actualización
    if (now - lastUpdateRef.current < 500) {
      return;
    }
    lastUpdateRef.current = now;

    const combinedString = (packet1 + "," + packet2).replace(/[\r\n\t]/g, '').trim();
    console.log("Combined string (cleaned):", JSON.stringify(combinedString));

    try {
      const values = combinedString
        .split(',')
        .map((val) => val.trim())
        .filter((val) => val !== "");

      console.log("Split values:", values);
      console.log("Values count:", values.length);

      if (values.length >= 7) {
        const parsed = values.map((val) => parseFloat(val));
        
        // Actualizar todos los estados de una vez para evitar múltiples re-renders
        setTemp(parsed[0] || 0);
        setHumi(parsed[1] || 0);
        setCond(parsed[2] || 0);
        setPh(parsed[3] || 0);
        setNitro(parsed[4] || 0);
        setPhos(parsed[5] || 0);
        setPota(parsed[6] || 0);
        
        console.log("All values set:", parsed);
      } else {
        console.log("Expected 7 values, got", values.length);
      }
    } catch (e) {
      console.log("Error decoding data:", e);
    }
  }, []);

  const scheduleProcessing = useCallback((packet1: string, packet2: string) => {
    // Cancelar timeout anterior si existe
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Programar procesamiento con un pequeño delay para evitar múltiples ejecuciones
    processingTimeoutRef.current = setTimeout(() => {
      if (packet1 && packet2) {
        processCompleteData(packet1, packet2);
      }
    }, 100);
  }, [processCompleteData]);

  // Función para manejar el paquete 1 (Temperatura, Humedad, Conductividad)
  const onPacket1Update = useCallback((
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log("Packet 1 Error:", error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Packet 1 data received");
      return; 
    }

    try {
      const rawData = Buffer.from(characteristic.value, 'base64');
      const stringValue = rawData.toString('utf-8').trim();
      
      console.log("Packet 1 received:", stringValue);
      setPacket1Data(stringValue);
      
      // Programar procesamiento si tenemos ambos paquetes
      setPacket2Data(prevPacket2 => {
        if (prevPacket2) {
          scheduleProcessing(stringValue, prevPacket2);
        }
        return prevPacket2;
      });
    } catch (e) {
      console.log("Error decoding Packet 1:", e);
    }
  }, [scheduleProcessing]);

  // Función para manejar el paquete 2 (pH, Nitrógeno, Fósforo, Potasio)
  const onPacket2Update = useCallback((
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log("Packet 2 Error:", error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Packet 2 data received");
      return;
    }

    try {
      const rawData = Buffer.from(characteristic.value, 'base64');
      const stringValue = rawData.toString('utf-8').trim();
      
      console.log("Packet 2 received:", stringValue);
      setPacket2Data(stringValue);
      
      // Programar procesamiento si tenemos ambos paquetes
      setPacket1Data(prevPacket1 => {
        if (prevPacket1) {
          scheduleProcessing(prevPacket1, stringValue);
        }
        return prevPacket1;
      });
    } catch (e) {
      console.log("Error decoding Packet 2:", e);
    }
  }, [scheduleProcessing]);

  const startStreamingData = async (device: Device) => {
    if (device) {
      // Monitorear ambas características
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        SENSOR_PACKET1_UUID,
        onPacket1Update
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        SENSOR_PACKET2_UUID,
        onPacket2Update
      );
      
      console.log("Started monitoring both BLE characteristics");
    } else {
      console.log("No Device Connected");
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    connectedDeviceName,
    disconnectFromDevice,
    humi,
    temp,
    cond,
    ph,
    nitro,
    phos,
    pota,
  };
}

export default useBLE;