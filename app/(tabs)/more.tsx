import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

export default function MoreScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={{ flex: 1, padding: theme.spacing(2) }}>
        <Text
          style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900" }}
        >
          Más
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
          Accesos adicionales para tu aventura 🧭
        </Text>

        <Card style={{ marginTop: theme.spacing(3), gap: 12 }}>
          <Button
            title="Transporte 🚗"
            variant="secondary"
            onPress={() => router.push("/(tabs)/transport")}
          />
          <Button
            title="Tienda 🛍️"
            variant="secondary"
            onPress={() => router.push("/(tabs)/shop")}
          />
        </Card>

        <Card style={{ marginTop: theme.spacing(2), gap: 12 }}>
          <Button
            title="Hostal / Guardería 🏡"
            variant="secondary"
            onPress={() => router.push("/(tabs)/bookings")} // luego lo cambiamos a una pantalla real
          />
          <Button
            title="Grooming ✂️"
            variant="secondary"
            onPress={() => router.push("/(tabs)/bookings")}
          />
          <Button
            title="Veterinario 🩺"
            variant="secondary"
            onPress={() => router.push("/(tabs)/bookings")}
          />
        </Card>
      </View>
    </Screen>
  );
}
