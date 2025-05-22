import { useEffect, useState } from 'react';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// Enhanced BLE detection with detailed diagnostics
const isBleSupported = () => {
  // Check if we're on web
  if (Platform.OS === 'web') {
    console.warn("BLE not supported on web platform");
    return false;
  }
  
  // Log available native modules for diagnostics
  console.log("Available native modules:", Object.keys(NativeModules));
  
  // Additional safety check for the native module
  try {
    // First check for the specific modules used by react-native-ble-plx
    if (!NativeModules.BleClientManager && !NativeModules.BleManager) {
      // Check if the library might be available under a different name
      const potentialBleModules = Object.keys(NativeModules).filter(name => 
        name.toLowerCase().includes('ble') || name.toLowerCase().includes('bluetooth')
      );
      
      if (potentialBleModules.length > 0) {
        console.warn("Found potential BLE modules:", potentialBleModules);
      }
      
      console.warn("Native BLE modules not found. Make sure react-native-ble-plx is properly installed and linked.");
      
      // Additional diagnostics for common issues
      if (Platform.OS === 'android' && !NativeModules.DeviceModule) {
        console.warn("DeviceModule not found - this may indicate a linking issue with native modules");
      }
      
      if (Platform.OS === 'ios' && !NativeModules.RCTBluetooth) {
        console.warn("RCTBluetooth not found - this may indicate a linking issue with native modules");
      }
      
      return false;
    }
    
    console.log("BLE modules found, BLE should be supported");
    return true;
  } catch (e) {
    console.warn("Error checking BLE support:", e);
    return false;
  }
};

// Create BLE manager with added safety checks
let bleManager: BleManager | null = null;
try {
  // Create manager only if environment supports it
  if (isBleSupported()) {
    console.log("Creating BLE Manager instance...");
    bleManager = new BleManager();
    console.log("BLE Manager initialized successfully");
  } else {
    console.warn("Not initializing BLE Manager due to lack of support");
  }
} catch (error) {
  console.error('Failed to initialize BLE manager:', error);
  bleManager = null;
}

// Define a proper interface with explicit typing for setAllDevices
interface BluetoothLowEnergyApi {
  requestPermissions: () => Promise<boolean>;
  scanForPeripherals: () => void;
  allDevices: Device[];
  setAllDevices: React.Dispatch<React.SetStateAction<Device[]>>; // Explicitly typed
  connectToDevice: (device: Device) => Promise<Device>;
  connectedDevice: Device | null;
  humi: number;
  temp: number;
  cond: number;
  ph: number;
  nitro: number;
  phos: number;
  pota: number;
  disconnectFromDevice: () => Promise<void>;
}

export default function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [humi, setHumi] = useState<number>(0);
  const [temp, setTemp] = useState<number>(0);
  const [cond, setCond] = useState<number>(0);
  const [ph, setPh] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(0);
  const [phos, setPhos] = useState<number>(0);
  const [pota, setPota] = useState<number>(0);

  // Request permissions for Bluetooth - improved implementation
  const requestPermissions = async (): Promise<boolean> => {
    // Check if BLE is supported before requesting permissions
    if (!isBleSupported()) {
      console.log('Bluetooth not supported in this environment');
      
      // Try to determine why BLE is not supported
      if (Platform.OS === 'android') {
        console.log("Running on Android device");
        
        // Check if this is an emulator
        const brand = NativeModules.PlatformConstants?.brand || '';
        const model = NativeModules.PlatformConstants?.model || '';
        
        if (brand.toLowerCase().includes('google') || model.toLowerCase().includes('sdk')) {
          console.warn("Running on Android emulator. Many emulators have limited or no BLE support.");
          console.warn("Try using a physical device for BLE functionality.");
        }
      }
      
      return false;
    }
    
    if (Platform.OS === 'ios') {
      // iOS permissions are managed differently
      return true;
    }

    if (Platform.OS === 'android') {
      try {
        console.log("Android version:", Platform.Version);
        
        // Basic permissions for all Android versions
        let basicPermissionGranted = true;
        
        // For Android 6.0+ (API 23+)
        if (Platform.Version >= 23) {
          console.log("Requesting location permission (required for BLE)");
          const locationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Permiso de ubicación para Bluetooth",
              message: "Esta app necesita acceso a tu ubicación para encontrar dispositivos Bluetooth cercanos",
              buttonPositive: "Aceptar",
              buttonNegative: "Cancelar",
              buttonNeutral: "Más tarde"
            }
          );
          
          console.log("Location permission result:", locationPermission);
          
          if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
            basicPermissionGranted = false;
            console.warn("Location permission denied - Bluetooth scanning won't work");
          }
        }
        
        // For Android 12+ (API 31+)
        let newPermissionsGranted = true;
        if (Platform.Version >= 31) {
          try {
            console.log("Android 12+ detected, requesting BLUETOOTH_SCAN");
            
            // Need to check if permission exists to avoid crashes on some devices
            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN) {
              const scanPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                {
                  title: "Permiso de escaneo Bluetooth",
                  message: "Esta app necesita buscar dispositivos Bluetooth cercanos",
                  buttonPositive: "Aceptar",
                  buttonNegative: "Cancelar",
                  buttonNeutral: "Más tarde"
                }
              );
              
              console.log("BLUETOOTH_SCAN permission result:", scanPermission);
              
              if (scanPermission !== PermissionsAndroid.RESULTS.GRANTED) {
                newPermissionsGranted = false;
                console.warn("Bluetooth scan permission denied");
              }
            } else {
              console.warn("BLUETOOTH_SCAN permission not available on this device");
            }
            
            console.log("Requesting BLUETOOTH_CONNECT");
            
            if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT) {
              const connectPermission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                {
                  title: "Permiso de conexión Bluetooth",
                  message: "Esta app necesita conectarse a dispositivos Bluetooth",
                  buttonPositive: "Aceptar",
                  buttonNegative: "Cancelar",
                  buttonNeutral: "Más tarde"
                }
              );
              
              console.log("BLUETOOTH_CONNECT permission result:", connectPermission);
              
              if (connectPermission !== PermissionsAndroid.RESULTS.GRANTED) {
                newPermissionsGranted = false;
                console.warn("Bluetooth connect permission denied");
              }
            } else {
              console.warn("BLUETOOTH_CONNECT permission not available on this device");
            }
          } catch (error) {
            console.error("Error requesting Android 12+ permissions:", error);
            // On some devices with custom ROMs, the new permissions might not be available
            console.log("Falling back to basic permissions");
          }
        }
        
        // For Android 12+, both sets of permissions must be granted
        // For older Android, only basic permissions are needed
        const hasRequiredPermissions = Platform.Version >= 31 
          ? (basicPermissionGranted && newPermissionsGranted)
          : basicPermissionGranted;
          
        console.log("Final permission state:", hasRequiredPermissions);
        return hasRequiredPermissions;
      } catch (err) {
        console.error('Error requesting permissions:', err);
        return false;
      }
    }
    
    return true;
  };

  // Scan for BLE peripherals
  const scanForPeripherals = (): void => {
    if (!bleManager) {
      console.error('BLE Manager not initialized');
      
      // Try reinitializing if possible
      if (isBleSupported()) {
        try {
          console.log("Attempting to reinitialize BLE Manager...");
          bleManager = new BleManager();
        } catch (error) {
          console.error("Failed to reinitialize BLE Manager:", error);
          return;
        }
      } else {
        return;
      }
    }

    try {
      // Stop any ongoing scan first
      bleManager.stopDeviceScan();
      
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device) {
          setAllDevices((prevDevices) => {
            // Check if device already exists in the list
            if (!prevDevices.find((d) => d.id === device.id)) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
      });

      // Stop scan after 5 seconds
      setTimeout(() => {
        if (bleManager) {
          bleManager.stopDeviceScan();
        }
      }, 5000);
    } catch (error) {
      console.error('Error during scanning:', error);
    }
  };

  // Connect to a device
  const connectToDevice = async (device: Device): Promise<Device> => {
    if (!bleManager) {
      throw new Error('BLE Manager not initialized');
    }

    try {
      const connectedDev = await bleManager.connectToDevice(device.id);
      setConnectedDevice(connectedDev);
      await connectedDev.discoverAllServicesAndCharacteristics();
      
      // Start monitoring characteristics
      startStreamingData(connectedDev);
      
      return connectedDev;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  // Disconnect from device
  const disconnectFromDevice = async (): Promise<void> => {
    if (!connectedDevice || !bleManager) {
      return;
    }

    try {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      // Reset sensor values
      setHumi(0);
      setTemp(0);
      setCond(0);
      setPh(0);
      setNitro(0);
      setPhos(0);
      setPota(0);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  // Set up data streaming from the device
  const startStreamingData = (device: Device): void => {
    if (!bleManager) return;
    
    // Replace these with your actual service and characteristic UUIDs
    // These are just example UUIDs
    const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
    const TEMP_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
    
    try {
      // Example for temperature monitoring
      device.monitorCharacteristicForService(
        SERVICE_UUID, 
        TEMP_CHAR_UUID, 
        (error, characteristic) => {
          if (error) {
            console.error('Temperature monitoring error:', error);
            return;
          }
          if (characteristic?.value) {
            const rawData = characteristic.value;
            // Process the data - adjust this based on your data format
            try {
              const tempValue = parseFloat(Buffer.from(rawData, 'base64').toString());
              setTemp(tempValue);
            } catch (e) {
              console.error('Error parsing temperature data:', e);
            }
          }
        }
      );
      
      // Add similar monitors for other characteristics
      // For humi, cond, ph, nitro, phos, pota, etc.
    } catch (error) {
      console.error('Error setting up characteristic monitoring:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectedDevice && bleManager) {
        bleManager.cancelDeviceConnection(connectedDevice.id)
          .catch(error => console.error('Error disconnecting:', error));
      }
    };
  }, [connectedDevice]);

  // Return all the required functions and state - including setAllDevices
  return {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    setAllDevices, // Ensure this is included here
    connectToDevice,
    connectedDevice,
    humi,
    temp,
    cond,
    ph,
    nitro,
    phos,
    pota,
    disconnectFromDevice,
  };
}
