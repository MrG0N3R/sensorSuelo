import { useState } from 'react';
import { Device } from 'react-native-ble-plx';

// Crear un mock para entornos donde BLE no está disponible (Expo Go, Web, etc.)
export default function useBleMock() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [humi, setHumi] = useState<number>(0);
  const [temp, setTemp] = useState<number>(0);
  const [cond, setCond] = useState<number>(0);
  const [ph, setPh] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(0);
  const [phos, setPhos] = useState<number>(0);
  const [pota, setPota] = useState<number>(0);

  // Simulation de datos
  const startDataSimulation = () => {
    // Actualiza los valores cada 2 segundos
    const interval = setInterval(() => {
      setTemp(Math.round((Math.random() * 30 + 10) * 10) / 10); // 10-40°C
      setHumi(Math.round(Math.random() * 100)); // 0-100%
      setCond(Math.round(Math.random() * 2000)); // 0-2000 µS/cm
      setPh(Math.round((Math.random() * 7 + 3) * 10) / 10); // 3-10 pH
      setNitro(Math.round(Math.random() * 100));
      setPhos(Math.round(Math.random() * 100));
      setPota(Math.round(Math.random() * 100));
    }, 2000);

    return () => clearInterval(interval);
  };

  // Simular solicitud de permisos (siempre retorna false para indicar no compatible)
  const requestPermissions = async () => {
    console.log('MOCK BLE: Permisos no disponibles en este entorno');
    return false;
  };

  // Simulación de escaneo - crea dispositivos simulados
  const scanForPeripherals = () => {
    console.log('MOCK BLE: Simulando escaneo');

    // Crear dispositivos simulados
    const mockDevices = [
      {
        id: 'mock-device-1',
        name: 'Sensor de Suelo (Simulado)',
        isConnectable: true,
      },
      {
        id: 'mock-device-2',
        name: 'Sensor #2 (Simulado)',
        isConnectable: true,
      },
    ] as unknown as Device[];

    setAllDevices(mockDevices);
  };

  // Simulación de conexión
  const connectToDevice = async (device: Device) => {
    console.log('MOCK BLE: Conectando a dispositivo simulado', device.id);
    setConnectedDevice(device);
    startDataSimulation();
    return device;
  };

  // Simulación de desconexión
  const disconnectFromDevice = async () => {
    console.log('MOCK BLE: Desconectando');
    setConnectedDevice(null);
    // Reiniciar valores
    setHumi(0);
    setTemp(0);
    setCond(0);
    setPh(0);
    setNitro(0);
    setPhos(0);
    setPota(0);
  };

  return {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    setAllDevices,
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
