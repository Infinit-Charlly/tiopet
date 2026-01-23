import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.bg,
            padding: theme.spacing(2),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 33,
                fontWeight: "900",
              }}
            >
              TíoPet
            </Text>

            <MaterialCommunityIcons
              name="paw"
              size={33}
              color={theme.colors.warn} // aquí controlas el color
            />
          </View>

          {/*           <Text
            style={{
              color: theme.colors.text,
              fontSize: 34,
              fontWeight: "900",
              marginTop: 8,
            }}
          >
            TíoPet 🐾
          </Text>  */}
          <Text
            style={{
              color: theme.colors.muted,
              marginTop: 8,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Latacunga • Quito • Porto Viejo
          </Text>

          <Card style={{ marginTop: theme.spacing(3) }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "800",
              }}
            >
              ¿Qué necesitas hoy?
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                marginTop: 6,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              Guardería, transporte y tíos de confianza. Tu peludito, seguro y
              feliz.
            </Text>

            <View style={{ marginTop: theme.spacing(2), gap: 12 }}>
              <Button
                title="Reservar cuidado"
                onPress={() => router.push("/(tabs)/bookings")}
              />

              <Button
                title="Pedir transporte"
                variant="secondary"
                onPress={() => router.push("/(tabs)/transport")}
              />

              <Button
                title="Tienda: snacks y baño"
                variant="secondary"
                onPress={() => router.push("/(tabs)/shop")}
              />
            </View>
          </Card>

          <Card style={{ marginTop: theme.spacing(2) }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Tu confianza es el producto
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                marginTop: 6,
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              Validaciones, testimonios, reportes diarios con fotos, y
              seguimiento de cada servicio.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
