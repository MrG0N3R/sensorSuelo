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
import { Item } from "@/components/Item";
import { ItemPaquete } from "@/components/ItemPaquete";
import colorScheme from "@/constants/colorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DeviceModal from "../../components/conn_modal";

// Define type for saved packages
type SavedPackage = {
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
    const [savedPackages, setSavedPackages] = useState<SavedPackage[]>([]);

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

    const startSensing = () => {
        if (!packageName.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el paquete");
            return;
        }
        setIsSensing(true);
    };

    const saveCurrentSensing = async () => {
        if (!packageName.trim()) {
            Alert.alert("Error", "Por favor ingresa un nombre para el paquete");
            return;
        }

        const newPackage: SavedPackage = {
            id: Date.now().toString(),
            name: packageName,
            date: getCurrentFormattedDateTime(),
            humi,
            temp,
            cond,
            ph,
            nitro,
            phos,
            pota,
        };

        const updatedPackages = [newPackage, ...savedPackages];
        setSavedPackages(updatedPackages);

        try {
            // Save to SecureStore
            await SecureStore.setItemAsync(
                "savedPackages",
                JSON.stringify(updatedPackages)
            );

            // Reset sensing state
            setIsSensing(false);
            setPackageName("");

            Alert.alert("Éxito", "Paquete guardado correctamente");
        } catch (error) {
            console.error("Error saving package:", error);
            Alert.alert("Error", "No se pudo guardar el paquete");
        }
    };

    const loadSavedPackages = async () => {
        try {
            const saved = await SecureStore.getItemAsync("savedPackages");
            if (saved) {
                const packages: SavedPackage[] = JSON.parse(saved);
                setSavedPackages(packages);
            }
        } catch (error) {
            console.error("Error loading saved packages:", error);
        }
    };

    const deletePackage = async (packageId: string) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que quieres eliminar este paquete?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedPackages = savedPackages.filter(
                                (pkg) => pkg.id !== packageId
                            );
                            setSavedPackages(updatedPackages);
                            await SecureStore.setItemAsync(
                                "savedPackages",
                                JSON.stringify(updatedPackages)
                            );
                        } catch (error) {
                            console.error("Error deleting package:", error);
                            Alert.alert(
                                "Error",
                                "No se pudo eliminar el paquete"
                            );
                        }
                    },
                },
            ]
        );
    };

    const uploadPackagesToServer = () => {
        console.log('Uploading packages to server:');
        console.log(JSON.stringify(savedPackages, null, 2));
        
        if (savedPackages.length === 0) {
            Alert.alert('Información', 'No hay paquetes guardados para subir');
            return;
        }
        
        Alert.alert('Éxito', `${savedPackages.length} paquete(s) enviados al servidor (ver consola)`);
    };

    const cancelSensing = () => {
        setIsSensing(false);
        setPackageName("");
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
                            onPress={startSensing}
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
                        {isSensing && (
                            <View>
                                <Item
                                    title={`Actual - ${packageName}`}
                                    ph={ph}
                                    cond={cond}
                                    date={getCurrentFormattedDateTime()}
                                    humi={humi}
                                    nitro={nitro}
                                    phos={phos}
                                    pota={pota}
                                    temp={temp}
                                />
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveCurrentSensing}
                                    >
                                        <MaterialIcons
                                            name="save"
                                            size={24}
                                            color={colorScheme.tint}
                                        />
                                        <Text style={styles.saveButtonText}>
                                            Guardar
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={cancelSensing}
                                    >
                                        <MaterialIcons
                                            name="cancel"
                                            size={24}
                                            color={colorScheme.tint}
                                        />
                                        <Text style={styles.cancelButtonText}>
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Upload button - only show if there are saved packages */}
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
                                    Subir {savedPackages.length} paquete(s) al servidor
                                </Text>
                            </TouchableOpacity>
                        )}

                        {savedPackages.map((pkg) => (
                            <ItemPaquete
                                key={pkg.id}
                                title={pkg.name}
                                date={pkg.date}
                                humi={pkg.humi}
                                temp={pkg.temp}
                                cond={pkg.cond}
                                ph={pkg.ph}
                                nitro={pkg.nitro}
                                phos={pkg.phos}
                                pota={pkg.pota}
                                onDelete={() => deletePackage(pkg.id)}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
