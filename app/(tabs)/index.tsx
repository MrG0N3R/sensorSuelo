import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import useBLE from "@/bluetooth/ble-wrapper";
import { DeviceModal } from "@/components/DeviceModal";
import { Item } from "@/components/Item";
import { ThemedText } from "@/components/ThemedText";
import colorScheme from "@/constants/colorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const {
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
    } = useBLE();

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
    const [packageName, setPackageName] = useState<string>("Paquete 1");

    // Update the timestamp when any sensor value changes
    useEffect(() => {
        if (connectedDevice) {
            setLastUpdated(new Date().toLocaleString());
        }
    }, [humi, temp, cond, ph, nitro, phos, pota]);

    const hideModal = () => {
        setIsModalVisible(false);
    };

    const scan = async () => {
        if (connectedDevice) {
            // If already connected, disconnect
            Alert.alert(
                "Dispositivo conectado",
                `¿Deseas desconectar de ${connectedDevice.name || connectedDevice.id}?`,
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                    },
                    {
                        text: "Desconectar",
                        onPress: () => disconnectFromDevice(),
                        style: "destructive",
                    },
                ]
            );
            return;
        }
        
        try {
            // Check if we're running in Expo Go
            const isExpoGo = (global as any).expo?.AppOwnership === 'expo';
            
            if (isExpoGo) {
                Alert.alert(
                    "Funcionalidad no disponible",
                    "El acceso a Bluetooth no está disponible en Expo Go. Por favor, crea una build de desarrollo o EAS build para usar esta funcionalidad.",
                    [
                        { text: "Entendido" }
                    ]
                );
                return;
            }
            
            console.log("Solicitando permisos de Bluetooth...");
            const isPermissionsEnabled = await requestPermissions();
            console.log("Resultado permisos Bluetooth:", isPermissionsEnabled);
            
            if (isPermissionsEnabled) {
                console.log("Permisos concedidos, iniciando escaneo...");
                setAllDevices([]);
                scanForPeripherals();
                setIsModalVisible(true);
            } else {
                console.log("Permisos denegados, mostrando alerta...");
                Alert.alert(    
                    "Acceso a Bluetooth no disponible",
                    "No se pudo acceder a la funcionalidad Bluetooth. Esto puede ocurrir por:\n\n" +
                    "1. Permisos denegados\n" +
                    "2. Ejecutando en Expo Go (no compatible)\n" +
                    "3. Problema con la instalación de los módulos nativos",
                    [
                        { 
                            text: "Cancelar",
                            style: "cancel"
                        },
                        {
                            text: "Ir a configuración",
                            onPress: () => {
                                try {
                                    const { Linking } = require('react-native');
                                    if (Platform.OS === 'android') {
                                        Linking.openSettings();
                                    } else {
                                        // iOS doesn't support opening directly to app settings
                                        Linking.openURL('app-settings:');
                                    }
                                } catch (e) {
                                    console.error("No se pudo abrir configuración:", e);
                                }
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error("Error durante la solicitud de permisos BLE:", error);
            Alert.alert(
                "Error de permisos Bluetooth",
                "Hubo un error al solicitar permisos de Bluetooth. Detalles: " + 
                (error instanceof Error ? error.message : String(error)),
                [{ text: "OK" }]
            );
        }
    };

    const handleConnect = (device: Device) => {
        connectToDevice(device)
            .then(() => {
                Alert.alert("Conectado", `Conectado exitosamente a ${device.name || device.id}`);
            })
            .catch((error) => {
                Alert.alert("Error de conexión", `No se pudo conectar: ${error.message}`);
            });
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.main}>
                <View
                    style={[
                        styles.top,
                        { paddingTop: insets.top, justifyContent: "center" },
                    ]}
                >
                    <Image
                        source={require("../../assets/images/react-logo.png")}
                        resizeMode="stretch"
                        style={{
                            width: "15%",
                            height: "85%",
                            alignSelf: "center",
                        }}
                    />
                    <ThemedText
                        type="subtitle"
                        style={{ alignSelf: "center" }}
                        darkColor={colorScheme.tint}
                        lightColor={colorScheme.tint}
                    >
                        Aplicacion de sensado
                    </ThemedText>
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
                                width: "20%",
                                height: "80%",
                                backgroundColor: colorScheme.subBackground,
                                borderRadius: 20,
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <MaterialIcons
                                size={30}
                                name="add-box"
                                color={colorScheme.tint}
                            />
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontStyle: "normal",
                                    fontWeight: "bold",
                                    color: colorScheme.tint,
                                }}
                            >
                                Nuevo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: "3%" }} />

                    <ScrollView>
                        <Item
                            key={1}
                            title={packageName}
                            ph={ph}
                            cond={cond}
                            date={lastUpdated}
                            humi={humi}
                            nitro={nitro}
                            phos={phos}
                            pota={pota}
                            temp={temp}
                        />

                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>

                <DeviceModal
                    closeModal={hideModal}
                    visible={isModalVisible}
                    connectToPeripheral={handleConnect}
                    devices={allDevices}
                />

                <TouchableOpacity
                    onPress={scan}
                    style={{
                        width: "20%",
                        height: "10%",
                        backgroundColor: connectedDevice 
                            ? colorScheme.accent 
                            : colorScheme.button,
                        borderRadius: 20,
                        borderColor: colorScheme.blackbars,
                        borderWidth: 2,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        bottom: 25,
                        right: 10,
                        margin: 10,
                    }}
                >
                    {connectedDevice ? (
                        <MaterialIcons
                            size={30}
                            name="bluetooth-connected"
                            color={colorScheme.tint}
                        />
                    ) : (
                        <MaterialIcons
                            size={30}
                            name="bluetooth"
                            color={colorScheme.tint}
                        />
                    )}
                </TouchableOpacity>
                
                {connectedDevice && (
                    <View style={styles.statusBar}>
                        <Text style={styles.statusText}>
                            Conectado a: {connectedDevice.name || connectedDevice.id}
                        </Text>
                    </View>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    top: {
        position: "absolute",
        left: 0,
        backgroundColor: "#000",
        width: "100%",
        height: "13%", // Increased height to accommodate safe area
        alignContent: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        zIndex: 1, // Ensure it's above other content
    },
    main: {
        width: "100%",
        height: "100%",
        backgroundColor: colorScheme.background,
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
        marginLeft: 15,
        width: "70%",
        height: "80%",
        outline: "none",
        fontSize: 20,
        color: colorScheme.tint,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
    statusBar: {
        position: "absolute",
        bottom: 90,
        width: "100%",
        backgroundColor: colorScheme.accent,
        padding: 5,
        alignItems: "center",
    },
    statusText: {
        color: colorScheme.tint,
        fontWeight: "bold",
    },
});
