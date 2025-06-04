import colorScheme from "@/constants/colorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
            `¿Estás seguro de que quieres eliminar el paquete "${packageName}" y todos sus sensores?`,
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
            <Collapsible
                title={`${packageName} (${sensos.length} sensores)`}
            >
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
                            <Text style={styles.buttonText}>
                                Agregar Sensor
                            </Text>
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
                                title={`Sensando: ${sensingName || "Nuevo sensor"}`}
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
                            No hay sensores en este paquete. Agrega uno usando
                            el botón "Agregar Sensor".
                        </Text>
                    )}
                </View>
            </Collapsible>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        borderBottomWidth: 5,
        borderColor: colorScheme.accent,
        marginTop: 15,
        marginHorizontal: 15,
    },
    contentContainer: {
        flexDirection: "column",
        width: "100%",
        backgroundColor: colorScheme.subBackground,
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    packageControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    addSensorButton: {
        backgroundColor: colorScheme.button,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: "48%",
    },
    deletePackageButton: {
        backgroundColor: "#FF6B6B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: "48%",
    },
    buttonText: {
        color: colorScheme.tint,
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    locationInfo: {
        backgroundColor: colorScheme.accent2,
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
    },
    locationText: {
        color: colorScheme.tint,
        fontSize: 12,
        marginBottom: 2,
    },
    sensingContainer: {
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 0,
        marginTop: 10,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: colorScheme.button,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: "48%",
    },
    cancelButton: {
        backgroundColor: "#FF6B6B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: "48%",
    },
    noSensorsText: {
        color: colorScheme.tint,
        fontSize: 14,
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 20,
        opacity: 0.7,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    titleText: {
        color: colorScheme.tint,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    sensingTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    sensingTitleText: {
        color: colorScheme.tint,
        fontSize: 14,
        marginLeft: 6,
    },
});
