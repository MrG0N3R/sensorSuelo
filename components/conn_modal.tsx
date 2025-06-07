import colorScheme from "@/constants/colorScheme";
import { modalStyle } from "@/styles//ConnModalStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React, { FC, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";

const TARGET_DEVICE_NAME_FRAGMENT = "tamachi";

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
    const deviceName =
        device.name ||
        device.localName ||
        `Dispositivo ${device.id.substring(0, 5)}`;

    // Check if deviceName contains "tamachi" ignoring case
    const isTargetDevice = deviceName
        .toLowerCase()
        .includes(TARGET_DEVICE_NAME_FRAGMENT);

    const rssi = device.rssi || "N/A";

    const connectAndCloseModal = useCallback(() => {
        connectToPeripheral(device);
        closeModal();
    }, [closeModal, connectToPeripheral, device]);

    return (
        <TouchableOpacity
            onPress={connectAndCloseModal}
            style={[
                modalStyle.deviceItem,
                isTargetDevice && modalStyle.targetDeviceItem,
            ]}
        >
            <View style={modalStyle.deviceItemContent}>
                <MaterialIcons
                    name={isTargetDevice ? "sensors" : "bluetooth"}
                    size={24}
                    color={isTargetDevice ? "#4CAF50" : colorScheme.tint}
                />
                <View style={modalStyle.deviceInfo}>
                    <Text
                        style={[
                            modalStyle.deviceName,
                            isTargetDevice && modalStyle.targetDeviceName,
                        ]}
                    >
                        {deviceName}
                        {isTargetDevice && " ✓"}
                    </Text>
                    <Text style={modalStyle.deviceId}>
                        ID: {device.id.substring(0, 10)}...
                    </Text>
                </View>
                <Text style={modalStyle.rssiText}>RSSI: {rssi}</Text>
            </View>
        </TouchableOpacity>
    );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
    const {
        devices,
        visible,
        connectToPeripheral,
        closeModal,
        isScanning = false,
    } = props;
    const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
    const [targetDeviceFound, setTargetDeviceFound] = useState<boolean>(false);

    useEffect(() => {
        // Filtrar dispositivos que contengan "tamachi" (ignora mayúsculas/minúsculas)
        const filtered = devices.filter((device) => {
            const name = device.name || device.localName || "";
            return name.toLowerCase().includes(TARGET_DEVICE_NAME_FRAGMENT);
        });

        // Eliminar duplicados
        const uniqueDevices = filtered.filter(
            (device, index, self) =>
                self.findIndex((d) => d.id === device.id) === index
        );

        setFilteredDevices(uniqueDevices);
        setTargetDeviceFound(uniqueDevices.length > 0);
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
                        <ActivityIndicator
                            size="large"
                            color={colorScheme.tint}
                        />
                        <Text style={modalStyle.emptyListText}>
                            Buscando dispositivos cercanos...
                        </Text>
                    </>
                ) : (
                    <>
                        <MaterialIcons
                            name="bluetooth-disabled"
                            size={48}
                            color={colorScheme.tint}
                        />
                        <Text style={modalStyle.emptyListText}>
                            No se encontraron dispositivos Bluetooth.
                        </Text>
                        <Text style={modalStyle.emptyListSubtext}>
                            Asegúrate de que tu sensor esté encendido y dentro
                            del rango.
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
                                ? `¡Tamachi encontrado!`
                                : "Dispositivos Tamachi"}
                        </Text>
                        <TouchableOpacity
                            onPress={closeModal}
                            style={modalStyle.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={colorScheme.tint}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={modalStyle.divider} />

                    {isScanning && (
                        <View style={modalStyle.scanningIndicator}>
                            <ActivityIndicator
                                size="small"
                                color={colorScheme.tint}
                            />
                            <Text style={modalStyle.scanningText}>
                                {targetDeviceFound
                                    ? `Sensor encontrado, buscando más dispositivos...`
                                    : "Buscando sensores Tamachi..."}
                            </Text>
                        </View>
                    )}

                    {targetDeviceFound && !isScanning && (
                        <View style={modalStyle.foundIndicator}>
                            <MaterialIcons
                                name="check-circle"
                                size={20}
                                color="#4CAF50"
                            />
                            <Text style={modalStyle.foundText}>
                                Sensor Tamachi encontrado, listo para conectar
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

export default DeviceModal;
