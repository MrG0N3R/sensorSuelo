

import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
    BleError,
    BleManager,
    Characteristic,
    Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";


const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";

const HUMI_CHARACTERISTIC_UUID = "b256faae-1447-4e32-9410-2c2653d3885c";
const TEMP_CHARACTERISTIC_UUID = "86dd3402-7feb-4e7c-80d0-a4ba5709f1ad";
const COND_CHARACTERISTIC_UUID = "7ff02cdb-c26f-4e64-ac9d-203d4b03094d";
const PH_CHARACTERISTIC_UUID = "a38cdf97-2ace-42e3-8ec8-c4a2caffb1fe";
const NITRO_CHARACTERISTIC_UUID = "89b4a0fa-eb32-4666-85d4-16a0ef4c706b";
const PHOS_CHARACTERISTIC_UUID = "77f636f6-456c-4d76-aec6-7e439a99abd3";
const POTA_CHARACTERISTIC_UUID = "35e92c28-d928-466b-8911-d235ae07f6e7";


interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
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
  //Instancia que controla el Bluetooth
  const bleManager = useMemo(() => new BleManager(), []);
  
  //Estado que guarda los dispositivos encontrados
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  
  //Guarda los dispositivos que estan conectados
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  
  //Valores recibidos del sensor
  const [humi, setHumi] = useState<number>(0);
  const [temp, setTemp] = useState<number>(0);
  const [cond, setCond] = useState<number>(0);
  const [ph, setPh] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(0);
  const [phos, setPhos] = useState<number>(0);
  const [pota, setPota] = useState<number>(0);


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

  //Detecta la versión de Android y solicita permisos necesarios para
  //escanear y conectar Bluetooth, ademas la ubicación para BLE
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
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };


  //Verifica si el dispositivo ya fue escaneado
  //para evitar duplicados
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

  //Conecta al dispositivo seleccionado con la ID y descubre todos los servicios y caracteristicas
  //necesario para ller datos
  //detiene el escaneo y comienza a recibir datos
  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
      alert(e)
    }
  };


  //Cancela la conexión con el dispositivo
  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHumi(0);
      setTemp(0);
      setCond(0);
      setPh(0);
      setNitro(0);
      setPhos(0);
      setPota(0);
    }
  };

  // Lee los datos de PH
  const onPhUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  )=>{  
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const value = Number.parseFloat(characteristic.value);
    setPh(value)
  }

  //// Lee los datos de Humedad
  const onHumiUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {  
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setHumi(value);
  };
  
  // Lee los datos de Temperatura
  const onTempUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setTemp(value);
  };
  
  // Lee los datos de Conductividad
  const onCondUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setCond(value);
  };
  
  // Lee los datos de Nitrogeno
  const onNitroUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setNitro(value);
  };
  
  // Lee los datos de Fosforo
  const onPhosUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setPhos(value);
  };
  
  //Lee los datos de potasio
  const onPotaUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return -1;
    }
  
    const value = Number.parseFloat(characteristic.value);
    setPota(value);
  };
  

  // Aqui se le dice al dispositivo que monitoree los cambios en las caracteristicas

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        PH_CHARACTERISTIC_UUID,
        onPhUpdate
      );
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        HUMI_CHARACTERISTIC_UUID,
        onHumiUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        TEMP_CHARACTERISTIC_UUID,
        onTempUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        COND_CHARACTERISTIC_UUID,
        onCondUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        PH_CHARACTERISTIC_UUID,
        onPhUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        NITRO_CHARACTERISTIC_UUID,
        onNitroUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        PHOS_CHARACTERISTIC_UUID,
        onPhosUpdate
      );
      
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        POTA_CHARACTERISTIC_UUID,
        onPotaUpdate
      );
      
    } else {
      console.log("No Device Connected");
    }
  };

  // Entonces el hook regresa funciones y estados para que los uses en el componente de react
  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
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