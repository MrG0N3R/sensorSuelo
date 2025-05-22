import colorScheme from "@/constants/colorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { FC, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Device } from "react-native-ble-plx";

// Target device name we're looking for
const TARGET_DEVICE_NAME = "SensorTierra";

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  isScanning?: boolean;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;
  
  const device = item.item;
  // Get device name or ID to display
  const deviceName = device.name || device.localName || `Dispositivo ${device.id.substring(0, 5)}`;
  
  // Check if this is our soil sensor
  const isSoilSensor = deviceName === TARGET_DEVICE_NAME;
  
  // Get device RSSI (signal strength) if available
  const rssi = device.rssi || 'N/A';
  
  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(device);
    closeModal();
  }, [closeModal, connectToPeripheral, device]);

  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={[
        modalStyle.deviceItem,
        isSoilSensor && modalStyle.targetDeviceItem
      ]}
    >
      <View style={modalStyle.deviceItemContent}>
        <MaterialIcons 
          name={isSoilSensor ? "sensors" : "bluetooth"} 
          size={24} 
          color={isSoilSensor ? "#4CAF50" : colorScheme.tint} 
        />
        <View style={modalStyle.deviceInfo}>
          <Text style={[
            modalStyle.deviceName,
            isSoilSensor && modalStyle.targetDeviceName
          ]}>
            {deviceName}
            {isSoilSensor && " ✓"}
          </Text>
          <Text style={modalStyle.deviceId}>ID: {device.id.substring(0, 10)}...</Text>
        </View>
        <Text style={modalStyle.rssiText}>RSSI: {rssi}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal, isScanning = false } = props;
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [targetDeviceFound, setTargetDeviceFound] = useState<boolean>(false);
  
  // Filter and sort devices with preference to our target device
  useEffect(() => {
    // Check if our target device is present
    const soilSensorDevice = devices.find(device => 
      (device.name === TARGET_DEVICE_NAME || device.localName === TARGET_DEVICE_NAME)
    );
    
    setTargetDeviceFound(!!soilSensorDevice);
    
    // Filter out devices without a name or localName
    // Sort with priority: 1. Target device 2. Devices with names 3. By signal strength
    const uniqueDevices = devices
      .filter((device, index, self) => 
        // Remove duplicates
        self.findIndex(d => d.id === device.id) === index &&
        // Optional: Filter out devices with empty names (uncomment if desired)
        // (device.name || device.localName)
        true
      )
      .sort((a, b) => {
        // First priority: Target device at the top
        if (a.name === TARGET_DEVICE_NAME) return -1;
        if (b.name === TARGET_DEVICE_NAME) return 1;
        if (a.localName === TARGET_DEVICE_NAME) return -1;
        if (b.localName === TARGET_DEVICE_NAME) return 1;
        
        // Second priority: Devices with names before nameless devices
        const aHasName = !!(a.name || a.localName);
        const bHasName = !!(b.name || b.localName);
        if (aHasName && !bHasName) return -1;
        if (!aHasName && bHasName) return 1;
        
        // Last priority: Sort by signal strength
        return (b.rssi || -100) - (a.rssi || -100);
      });
    
    setFilteredDevices(uniqueDevices);
  }, [devices]);

  const keyExtractor = useCallback((device: Device) => device.id, []);

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );

  const renderEmptyList = useCallback(() => {
    return (
      <View style={modalStyle.emptyList}>
        {isScanning ? (
          <>
            <ActivityIndicator size="large" color={colorScheme.tint} />
            <Text style={modalStyle.emptyListText}>
              Buscando dispositivos cercanos...
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="bluetooth-disabled" size={48} color={colorScheme.tint} />
            <Text style={modalStyle.emptyListText}>
              No se encontraron dispositivos Bluetooth.
            </Text>
            <Text style={modalStyle.emptyListSubtext}>
              Asegúrate de que tu sensor esté encendido y dentro del rango.
            </Text>
          </>
        )}
      </View>
    );
  }, [isScanning]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={modalStyle.modalContainer}>
        <View style={modalStyle.modalContent}>
          <View style={modalStyle.modalHeader}>
            <Text style={modalStyle.modalTitleText}>
              {targetDeviceFound 
                ? `¡${TARGET_DEVICE_NAME} encontrado!` 
                : "Dispositivos disponibles"}
            </Text>
            <TouchableOpacity onPress={closeModal} style={modalStyle.closeButton}>
              <MaterialIcons name="close" size={24} color={colorScheme.tint} />
            </TouchableOpacity>
          </View>
          
          <View style={modalStyle.divider} />
          
          {isScanning && (
            <View style={modalStyle.scanningIndicator}>
              <ActivityIndicator size="small" color={colorScheme.tint} />
              <Text style={modalStyle.scanningText}>
                {targetDeviceFound 
                  ? `Sensor encontrado, buscando más dispositivos...` 
                  : "Buscando sensores de tierra..."}
              </Text>
            </View>
          )}
          
          {targetDeviceFound && !isScanning && (
            <View style={modalStyle.foundIndicator}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={modalStyle.foundText}>
                Sensor de tierra encontrado, listo para conectar
              </Text>
            </View>
          )}
          
          <FlatList
            data={filteredDevices}
            renderItem={renderDeviceModalListItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={modalStyle.listContainer}
            ListEmptyComponent={renderEmptyList}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 15,
    backgroundColor: colorScheme.subBackground,
    borderWidth: 2,
    borderColor: colorScheme.blackbars,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  closeButton: {
    padding: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colorScheme.blackbars,
    marginHorizontal: 15,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  scanningText: {
    color: colorScheme.tint,
    marginLeft: 10,
    fontSize: 14,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colorScheme.tint,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  deviceItem: {
    backgroundColor: colorScheme.button,
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  deviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  deviceId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  rssiText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: colorScheme.tint,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  emptyListSubtext: {
    color: colorScheme.tint,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
  targetDeviceItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)', // Green background for target device
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  targetDeviceName: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  foundIndicator: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  foundText: {
    color: '#4CAF50',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default DeviceModal;