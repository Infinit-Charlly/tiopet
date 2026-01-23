import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { Screen } from "../src/ui/Screen";

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planId = String(params.planId ?? "bb");

  const planIcon =
    planId === "bb"
      ? "shield-check"
      : planId === "consientan"
        ? "heart"
        : "crown";

  const petName = String(params.petName ?? "");
  const petType = String(params.petType ?? "Perro");
  const plan = String(params.plan ?? "");
  const time = String(params.time ?? "");
  const city = String(params.city ?? "");
  const date = String(params.date ?? "");
  const total = String(params.total ?? "");

  return (
    <Screen>
      <ScrollView>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Confirmación
        </Text>
        <Text
          style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}
        >
          Revisa que todo esté perfecto. Tu peludito está por ser tratado como
          rey 👑
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <View style={{ marginTop: 14, gap: 10 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name={planIcon as any}
                size={18}
                color={theme.colors.warn}
              />
              <Text style={{ color: theme.colors.muted }}>
                Plan:{" "}
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {plan}
                </Text>
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={theme.colors.warn}
              />
              <Text style={{ color: theme.colors.muted }}>
                Tiempo:{" "}
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {time}
                </Text>
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={theme.colors.warn}
              />
              <Text style={{ color: theme.colors.muted }}>
                Ciudad:{" "}
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {city}
                </Text>
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={18}
                color={theme.colors.warn}
              />
              <Text style={{ color: theme.colors.muted }}>
                Fecha:{" "}
                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                  {date}
                </Text>
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: theme.colors.line,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: theme.colors.muted, fontWeight: "900" }}>
              TOTAL
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
                fontSize: 20,
              }}
            >
              {total}
            </Text>
          </View>
        </Card>

        <View style={{ marginTop: theme.spacing(2) }}>
          <Button
            title="Confirmar reserva ✅"
            onPress={() => {
              // MVP: solo mostramos que se confirmó y volvemos a Inicio
              router.replace("/(tabs)");
            }}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Volver"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
