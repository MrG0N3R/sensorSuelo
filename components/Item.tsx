import colorScheme from "@/constants/colorScheme";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Text, View } from "react-native";
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
        <View
            style={{
                borderRadius: 5,
                borderBottomWidth: 5,
                borderColor: colorScheme.accent,
                marginTop: 5,
            }}
        >
            <Collapsible title={title}>
                <View style={{ flexDirection: "column" }}>
                    <Text
                        style={{
                            color: colorScheme.tint,
                            fontSize: 20,
                            alignSelf: "center",
                        }}
                    >
                        {" "}
                        {date}{" "}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            marginTop: 10,
                            marginLeft: 15,
                        }}
                    >
                        <FontAwesome
                            name="thermometer-empty"
                            size={70}
                            color={colorScheme.icon2}
                            style={{ backgroundColor: colorScheme.accent }}
                        />
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Temperatura
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {temp}°C
                            </Text>
                        </View>
                        <Ionicons
                            name="water"
                            size={70}
                            color={colorScheme.icon2}
                            style={{ backgroundColor: colorScheme.accent }}
                        />
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Humedad
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {humi}{" "}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <MaterialCommunityIcons
                            name="lightning-bolt"
                            size={60}
                            color={colorScheme.icon2}
                            style={{
                                backgroundColor: colorScheme.accent,
                                alignSelf: "center",
                            }}
                        />
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Conductividad
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {cond} us/cm
                            </Text>
                        </View>
                        <FontAwesome
                            name="flask"
                            size={70}
                            color={colorScheme.icon2}
                            style={{ backgroundColor: colorScheme.accent }}
                        />
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                pH
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {ph}{" "}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <Text
                            style={{
                                alignSelf: "center",
                                fontSize: 40,
                                color: colorScheme.icon2,
                                marginLeft: 15,
                                fontStyle: "italic",
                            }}
                        >
                            N
                        </Text>
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Nitrogeno
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {nitro} mg/kg
                            </Text>
                        </View>
                        <Text
                            style={{
                                alignSelf: "center",
                                fontSize: 40,
                                color: colorScheme.icon2,
                                marginLeft: 20,
                                fontStyle: "italic",
                            }}
                        >
                            P
                        </Text>
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Fosforo
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {phos} mg/kg
                            </Text>
                        </View>
                        <Text
                            style={{
                                alignSelf: "center",
                                fontSize: 40,
                                color: colorScheme.icon2,
                                marginLeft: 20,
                                fontStyle: "italic",
                            }}
                        >
                            K
                        </Text>
                        <View style={{ flexDirection: "column", flex: 1 }}>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                Potasio
                            </Text>
                            <Text
                                style={{
                                    alignSelf: "center",
                                    fontSize: 20,
                                    color: colorScheme.tint,
                                }}
                            >
                                {" "}
                                {pota} mg/kg
                            </Text>
                        </View>
                    </View>
                </View>
            </Collapsible>
        </View>
    );
}
