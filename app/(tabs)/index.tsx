import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import useBLE from "@/bluetooth/ble";
import { PackageCard, PackageData, SensorData } from "@/components/PackageCard";
import colorScheme from "@/constants/colorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DeviceModal from "../../components/conn_modal";

// Update type definition
type SavedPackages = PackageData[];

export default function HomeScreen() {
    const {
        requestPermissions,
        scanForPeripherals,
        allDevices,
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
    } = useBLE();

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isSensing, setIsSensing] = useState<boolean>(false);
    const [packageName, setPackageName] = useState<string>("");
    const [sensorName, setSensorName] = useState<string>("");
    const [savedPackages, setSavedPackages] = useState<SavedPackages>([]);
    const [sensingPackageId, setSensingPackageId] = useState<number | null>(
        null
    );

    // Load saved packages on component mount
    useEffect(() => {
        loadSavedPackages();
    }, []);

    const hideModal = () => {
        setIsModalVisible(false);
    };

    const scan = async () => {
        const isPermissionsEnabled = await requestPermissions();
        if (isPermissionsEnabled) {
            scanForPeripherals();
            setIsModalVisible(true);
        }
    };

    const startNewPackage = () => {
        if (!packageName.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el paquete");
            return;
        }

        const newPackage: PackageData = {
            packageName: packageName,
            packageId: Date.now(),
            location: {
                latitude: 21.146633, // Default location, could be from GPS
                longitude: -101.711319,
                date: new Date().toISOString(),
            },
            sensos: [],
        };

        const updatedPackages = [newPackage, ...savedPackages];
        setSavedPackages(updatedPackages);
        savePackagesToStorage(updatedPackages);
        setPackageName("");

        Alert.alert("Éxito", "Nuevo paquete creado correctamente");
    };

    const addSensorToPackage = (packageId: number) => {
        const packageIndex = savedPackages.findIndex(
            (pkg) => pkg.packageId === packageId
        );
        if (packageIndex === -1) return;

        const sensorCount = savedPackages[packageIndex].sensos.length + 1;
        const defaultName = `Sensor_${sensorCount.toString().padStart(3, "0")}`;

        setSensorName(defaultName);
        setSensingPackageId(packageId);
        setIsSensing(true);
    };

    const saveSensorToPackage = async (
        packageId: number,
        sensorName: string
    ) => {
        if (!sensorName.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el sensor");
            return;
        }

        const newSensor: SensorData = {
            id: Date.now().toString(),
            name: sensorName,
            date: getCurrentFormattedDateTime(),
            humi,
            temp,
            cond,
            ph,
            nitro,
            phos,
            pota,
        };

        const updatedPackages = savedPackages.map((pkg) => {
            if (pkg.packageId === packageId) {
                return {
                    ...pkg,
                    sensos: [newSensor, ...pkg.sensos],
                };
            }
            return pkg;
        });

        setSavedPackages(updatedPackages);
        await savePackagesToStorage(updatedPackages);

        // Reset sensing state
        setIsSensing(false);
        setSensorName("");
        setSensingPackageId(null);

        Alert.alert("Éxito", "Sensor guardado correctamente");
    };

    const savePackagesToStorage = async (packages: SavedPackages) => {
        try {
            await SecureStore.setItemAsync(
                "savedPackages",
                JSON.stringify(packages)
            );
        } catch (error) {
            console.error("Error saving packages:", error);
        }
    };

    const loadSavedPackages = async () => {
        try {
            const saved = await SecureStore.getItemAsync("savedPackages");
            if (saved) {
                const packages: SavedPackages = JSON.parse(saved);
                setSavedPackages(packages);
            }
        } catch (error) {
            console.error("Error loading saved packages:", error);
        }
    };

    const deletePackage = async (packageId: number) => {
        const updatedPackages = savedPackages.filter(
            (pkg) => pkg.packageId !== packageId
        );
        setSavedPackages(updatedPackages);
        await savePackagesToStorage(updatedPackages);
    };

    const deleteSensor = async (packageId: number, sensorId: string) => {
        const updatedPackages = savedPackages.map((pkg) => {
            if (pkg.packageId === packageId) {
                return {
                    ...pkg,
                    sensos: pkg.sensos.filter(
                        (sensor) => sensor.id !== sensorId
                    ),
                };
            }
            return pkg;
        });
        setSavedPackages(updatedPackages);
        await savePackagesToStorage(updatedPackages);
    };

    const uploadPackagesToServer = () => {
        console.log("Uploading packages to server:");
        console.log(JSON.stringify(savedPackages, null, 2));

        if (savedPackages.length === 0) {
            Alert.alert("Información", "No hay paquetes guardados para subir");
            return;
        }

        const totalSensors = savedPackages.reduce(
            (total, pkg) => total + pkg.sensos.length,
            0
        );
        Alert.alert(
            "Éxito",
            `${savedPackages.length} paquete(s) con ${totalSensors} sensores enviados al servidor (ver consola)`
        );
    };

    const cancelSensing = () => {
        setIsSensing(false);
        setSensorName("");
        setSensingPackageId(null);
    };

    // Function to format the current date and time
    const getCurrentFormattedDateTime = () => {
        const now = new Date();

        // Format: DD/MM/YYYY HH:MM:SS
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

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="light-content" />
            <View style={styles.main}>
                <View style={styles.top}>
                    <Image
                        source={require("../../assets/images/icono.png")}
                        resizeMode="contain"
                        style={{
                            width: "75%",
                            height: "170%",
                            alignSelf: "center",
                        }}
                    />
                </View>

                <View style={{ height: "13%" }}></View>
                <View style={{ height: "96%", width: "100%" }}>
                    <View style={styles.container}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del Paquete"
                            placeholderTextColor={
                                colorScheme.placeholderTextColor
                            }
                            value={packageName}
                            onChangeText={setPackageName}
                        />
                        <TouchableOpacity
                            style={{
                                marginLeft: 5,
                                width: "25%",
                                height: "100%",
                                backgroundColor: colorScheme.subBackground,
                                borderRadius: 20,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={startNewPackage}
                        >
                            <MaterialIcons
                                size={30}
                                name="add"
                                color={colorScheme.tint}
                            />
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontStyle: "italic",
                                    color: colorScheme.tint,
                                }}
                            >
                                Nuevo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: "3%" }} />

                    <ScrollView>
                        {/* Upload button */}
                        {savedPackages.length > 0 && (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={uploadPackagesToServer}
                            >
                                <MaterialIcons
                                    name="cloud-upload"
                                    size={24}
                                    color={colorScheme.tint}
                                />
                                <Text style={styles.uploadButtonText}>
                                    Subir {savedPackages.length} paquete(s) al
                                    servidor
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Package cards */}
                        {savedPackages.map((packageData, packageIndex) => (
                            <PackageCard
                                key={`package-${packageData.packageId}-${packageIndex}`}
                                packageData={packageData}
                                onDeletePackage={deletePackage}
                                onAddSensor={addSensorToPackage}
                                onDeleteSensor={deleteSensor}
                                currentSensorData={{
                                    humi,
                                    temp,
                                    cond,
                                    ph,
                                    nitro,
                                    phos,
                                    pota,
                                }}
                                isSensing={isSensing}
                                sensingPackageId={sensingPackageId || undefined}
                                sensingName={sensorName}
                                onSaveSensor={saveSensorToPackage}
                                onCancelSensing={cancelSensing}
                            />
                        ))}

                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>

                <DeviceModal
                    closeModal={hideModal}
                    visible={isModalVisible}
                    connectToPeripheral={connectToDevice}
                    devices={allDevices}
                />

                <TouchableOpacity
                    onPress={scan}
                    style={{
                        width: "25%",
                        height: "10%",
                        backgroundColor: colorScheme.button,
                        borderRadius: 20,
                        borderColor: colorScheme.blackbars,
                        borderWidth: 2,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        bottom: 25,
                        right: 10,
                    }}
                >
                    <MaterialIcons
                        size={30}
                        name="bluetooth-searching"
                        color={colorScheme.tint}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    top: {
        position: "absolute",
        left: 0,
        width: "100%",
        height: "10%",
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    main: {
        width: "100%",
        height: "100%",
        backgroundColor: colorScheme.background,
        paddingTop: StatusBar.currentHeight || 0, // Add padding for status bar
    },
    container: {
        height: "10%",
        width: "100%",
        flexDirection: "row",
        outline: "none",

        alignItems: "center",
    },
    input: {
        borderWidth: 2,
        borderRadius: 15,
        borderColor: colorScheme.accent,
        backgroundColor: colorScheme.subBackground,
        justifyContent: "center",
        marginHorizontal: 5,
        width: "70%",
        height: "100%",
        outline: "none",
        fontSize: 20,
        color: colorScheme.tint,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: colorScheme.button,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: "48%",
    },
    saveButtonText: {
        color: colorScheme.tint,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: colorScheme.secondaryButton || "#FF6B6B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: "48%",
    },
    cancelButtonText: {
        color: colorScheme.tint,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
    uploadButton: {
        backgroundColor: colorScheme.accent,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 10,
    },
    uploadButtonText: {
        color: colorScheme.tint,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
});
