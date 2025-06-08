import colorScheme from "@/constants/colorScheme";
import { styles } from "@/styles/PackageCardStyles";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Collapsible } from "./Collapsible";
import { Item } from "./Item";
import { ItemPaquete } from "./ItemPaquete";

export type SensorData = {
    id: string;
    name: string;
    date: string;
    humi: number;
    temp: number;
    cond: number;
    ph: number;
    nitro: number;
    phos: number;
    pota: number;
};

export type PackageData = {
    packageName: string;
    packageId: number;
    deviceName?: string;
    location: {
        latitude: number;
        longitude: number;
        date: string;
    };
    sensos: SensorData[];
};

export type PackageCardProps = {
    packageData: PackageData;
    onDeletePackage: (packageId: number) => void;
    onAddSensor: (packageId: number) => void;
    onDeleteSensor: (packageId: number, sensorId: string) => void;
    currentSensorData?: {
        humi: number;
        temp: number;
        cond: number;
        ph: number;
        nitro: number;
        phos: number;
        pota: number;
    };
    isSensing?: boolean;
    sensingPackageId?: number;
    sensingName?: string;
    onSaveSensor?: (packageId: number, sensorName: string) => void;
    onCancelSensing?: () => void;
};

export function PackageCard({
    packageData,
    onDeletePackage,
    onAddSensor,
    onDeleteSensor,
    currentSensorData,
    isSensing = false,
    sensingPackageId,
    sensingName = "",
    onSaveSensor,
    onCancelSensing,
}: PackageCardProps) {
    // Validate packageData to prevent undefined errors
    if (!packageData || !packageData.location) {
        return null;
    }

    const { packageName, packageId, location, sensos = [] } = packageData;
    const {
        latitude = 0,
        longitude = 0,
        date = new Date().toISOString(),
    } = location;

    const handleAddSensor = () => {
        onAddSensor(packageId);
    };

    const handleDeletePackage = () => {
        Alert.alert(
            "Confirmar eliminación",
            `¿Estás seguro de que quieres eliminar el paquete "${packageName}" y todos sus sensos?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => onDeletePackage(packageId),
                },
            ]
        );
    };

    const handleSaveSensor = () => {
        if (!sensingName?.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el sensor");
            return;
        }
        onSaveSensor?.(packageId, sensingName);
    };

    const getCurrentFormattedDateTime = () => {
        const now = new Date();
        return `${now.getDate().toString().padStart(2, "0")}/${(
            now.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}/${now.getFullYear()} ${now
            .getHours()
            .toString()
            .padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    };

    const isCurrentPackageSensing = isSensing && sensingPackageId === packageId;

    return (
        <View style={styles.container}>
            <Collapsible title={`${packageName} (${sensos.length} sensos)`}>
                <View style={styles.contentContainer}>
                    {/* Package controls */}
                    <View style={styles.packageControls}>
                        <TouchableOpacity
                            style={styles.addSensorButton}
                            onPress={handleAddSensor}
                        >
                            <MaterialIcons
                                name="add"
                                size={20}
                                color={colorScheme.tint}
                            />
                            <Text style={styles.buttonText}>Agregar Senso</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deletePackageButton}
                            onPress={handleDeletePackage}
                        >
                            <MaterialIcons
                                name="delete"
                                size={20}
                                color={colorScheme.tint}
                            />
                            <Text style={styles.buttonText}>
                                Eliminar Paquete
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Location info */}
                    <View style={styles.locationInfo}>
                        <View style={styles.locationRow}>
                            <MaterialIcons
                                name="location-on"
                                size={16}
                                color={colorScheme.tint}
                            />
                            <Text style={styles.locationText}>
                                Lat: {latitude.toFixed(6)}, Lng:{" "}
                                {longitude.toFixed(6)}
                            </Text>
                        </View>
                        <View style={styles.locationRow}>
                            <MaterialIcons
                                name="schedule"
                                size={16}
                                color={colorScheme.tint}
                            />
                            <Text style={styles.locationText}>
                                {new Date(date).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Current sensing */}
                    {isCurrentPackageSensing && currentSensorData && (
                        <View style={styles.sensingContainer}>
                            <Item
                                title={sensingName || "Nuevo sensor"}
                                ph={currentSensorData.ph}
                                cond={currentSensorData.cond}
                                date={getCurrentFormattedDateTime()}
                                humi={currentSensorData.humi}
                                nitro={currentSensorData.nitro}
                                phos={currentSensorData.phos}
                                pota={currentSensorData.pota}
                                temp={currentSensorData.temp}
                            />
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveSensor}
                                >
                                    <MaterialIcons
                                        name="save"
                                        size={20}
                                        color={colorScheme.tint}
                                    />
                                    <Text style={styles.buttonText}>
                                        Guardar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={onCancelSensing}
                                >
                                    <MaterialIcons
                                        name="cancel"
                                        size={20}
                                        color={colorScheme.tint}
                                    />
                                    <Text style={styles.buttonText}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Saved sensors */}
                    {sensos.map((sensor, sensorIndex) => (
                        <ItemPaquete
                            key={`sensor-${packageId}-${sensor.id}-${sensorIndex}`}
                            title={sensor.name}
                            date={sensor.date}
                            humi={sensor.humi}
                            temp={sensor.temp}
                            cond={sensor.cond}
                            ph={sensor.ph}
                            nitro={sensor.nitro}
                            phos={sensor.phos}
                            pota={sensor.pota}
                            onDelete={() =>
                                onDeleteSensor(packageId, sensor.id)
                            }
                        />
                    ))}

                    {sensos.length === 0 && !isCurrentPackageSensing && (
                        <Text style={styles.noSensorsText}>
                            No hay registros en este paquete. Agrega uno usando
                            el botón "Agregar Senso".
                        </Text>
                    )}
                </View>
            </Collapsible>
        </View>
    );
}
