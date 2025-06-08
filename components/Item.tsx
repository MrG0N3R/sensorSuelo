import colorScheme from "@/constants/colorScheme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Collapsible } from "./Collapsible";

export type ItemProps = {
    title: string;
    date: string;
    humi: number;
    temp: number;
    cond: number;
    ph: number;
    nitro: number;
    phos: number;
    pota: number;
};

export function Item({
    title,
    date,
    humi,
    temp,
    cond,
    ph,
    nitro,
    phos,
    pota,
}: ItemProps) {
    return (
        <View style={styles.container}>
            <Collapsible title={title}>
                <View style={styles.contentContainer}>
                    <Text style={styles.dateText}>{date}</Text>

                    {/* Temperature and Humidity Row */}
                    <View style={styles.row}>
                        <View style={styles.sensorGroup}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons
                                    name="thermostat"
                                    size={40}
                                    color={colorScheme.icon2}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>
                                    Temperatura
                                </Text>
                                <Text style={styles.valueText}>{temp}°C</Text>
                            </View>
                        </View>

                        <View style={styles.sensorGroup}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons
                                    name="water-drop"
                                    size={40}
                                    color={colorScheme.icon2}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>Humedad</Text>
                                <Text style={styles.valueText}>{humi}%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Conductivity and pH Row */}
                    <View style={styles.row}>
                        <View style={styles.sensorGroup}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name="lightning-bolt"
                                    size={40}
                                    color={colorScheme.icon2}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>
                                    Conductividad
                                </Text>
                                <Text style={styles.valueText}>
                                    {cond} µs/cm
                                </Text>
                            </View>
                        </View>

                        <View style={styles.sensorGroup}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons
                                    name="science"
                                    size={40}
                                    color={colorScheme.icon2}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>pH</Text>
                                <Text style={styles.valueText}>{ph}</Text>
                            </View>
                        </View>
                    </View>

                    {/* NPK Row */}
                    <View style={styles.npkRow}>
                        <View style={styles.npkGroup}>
                            <Text style={styles.npkSymbol}>N</Text>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>Nitrógeno</Text>
                                <Text style={styles.valueText}>
                                    {nitro} mg/kg
                                </Text>
                            </View>
                        </View>

                        <View style={styles.npkGroup}>
                            <Text style={styles.npkSymbol}>P</Text>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>Fósforo</Text>
                                <Text style={styles.valueText}>
                                    {phos} mg/kg
                                </Text>
                            </View>
                        </View>

                        <View style={styles.npkGroup}>
                            <Text style={styles.npkSymbol}>K</Text>
                            <View style={styles.textContainer}>
                                <Text style={styles.labelText}>Potasio</Text>
                                <Text style={styles.valueText}>
                                    {pota} mg/kg
                                </Text>
                            </View>
                        </View>
                    </View>
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
    dateText: {
        color: colorScheme.tint,
        fontSize: 15,
        alignSelf: "center",
        marginBottom: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    sensorGroup: {
        flexDirection: "row",
        alignItems: "center",
        width: "48%",
    },
    iconContainer: {
        width: 50,
        height: 50,
        backgroundColor: colorScheme.accent2,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    textContainer: {
        flexDirection: "column",
        flex: 1,
    },
    labelText: {
        fontSize: 15,
        color: colorScheme.tint,
        fontWeight: "normal",
    },
    valueText: {
        fontSize: 15,
        color: colorScheme.tint,
        fontWeight: "bold",
        marginTop: 2,
    },
    npkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    npkGroup: {
        flexDirection: "row",
        alignItems: "center",
        width: "32%",
    },
    npkSymbol: {
        fontSize: 32,
        fontWeight: "bold",
        fontStyle: "italic",
        color: colorScheme.icon2,
        width: 40,
        textAlign: "center",
        marginRight: 5,
    },
});
