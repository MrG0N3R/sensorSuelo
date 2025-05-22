import { useState } from "react";

// Mock device type that mimics the original Device type
interface Device {
  id: string;
  name: string;
  localName?: string;
}

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

// Mock devices data
const mockDevices: Device[] = [
  { id: "1", name: "Sensor de Suelo 1" },
  { id: "2", name: "Sensor de Suelo 2" },
  { id: "3", name: "Sensor de Suelo 3" },
];

function useBLE(): BluetoothLowEnergyApi {
    // Mock states
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

    // Test data values
    const [humi, setHumi] = useState<number>(60);
    const [temp, setTemp] = useState<number>(25.5);
    const [cond, setCond] = useState<number>(450);
    const [ph, setPh] = useState<number>(6.8);
    const [nitro, setNitro] = useState<number>(35);
    const [phos, setPhos] = useState<number>(18);
    const [pota, setPota] = useState<number>(22);

    // Mock function to simulate permission request
    const requestPermissions = async (): Promise<boolean> => {
        console.log('Requesting mock permissions');
        return true;
    };

    // Mock function to simulate device scanning
    const scanForPeripherals = () => {
        console.log('Scanning for mock devices');
        setTimeout(() => {
            setAllDevices(mockDevices);
        }, 2000); // Simulate 2 seconds of scanning
    };

    // Mock function to simulate connecting to a device
    const connectToDevice = async (device: Device) => {
        console.log(`Connecting to mock device: ${device.name}`);
        
        setTimeout(() => {
            setConnectedDevice(device);
            startGeneratingRandomData();
        }, 1000); // Simulate 1 second connection time
    };

    // Mock function to simulate disconnecting
    const disconnectFromDevice = () => {
        console.log('Disconnecting mock device');
        setConnectedDevice(null);
        setHumi(60);
        setTemp(25.5);
        setCond(450);
        setPh(6.8);
        setNitro(35);
        setPhos(18);
        setPota(22);
    };

    // Generate random data within reasonable ranges to simulate sensor readings
    const startGeneratingRandomData = () => {
        const interval = setInterval(() => {
            if (connectedDevice) {
                setHumi(Math.floor(Math.random() * (80 - 40 + 1) + 40)); // 40-80%
                setTemp(parseFloat((Math.random() * (30 - 20) + 20).toFixed(1))); // 20-30°C
                setCond(Math.floor(Math.random() * (600 - 300 + 1) + 300)); // 300-600 units
                setPh(parseFloat((Math.random() * (7.5 - 5.5) + 5.5).toFixed(1))); // pH 5.5-7.5
                setNitro(Math.floor(Math.random() * (50 - 20 + 1) + 20)); // 20-50 units
                setPhos(Math.floor(Math.random() * (30 - 10 + 1) + 10)); // 10-30 units
                setPota(Math.floor(Math.random() * (35 - 15 + 1) + 15)); // 15-35 units
            } else {
                clearInterval(interval);
            }
        }, 3000); // Update every 3 seconds

        // Clean up on unmount
        return () => clearInterval(interval);
    };

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
