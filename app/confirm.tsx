import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { TransportType, useBookingsStore } from "../src/store/bookingsStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { Screen } from "../src/ui/Screen";

type PetType = "Perro" | "Gato";
type PlanId = "bb" | "consientan" | "principe";
type CareTime = "day" | "full";

function pickString(v: unknown, fallback = "") {
  return typeof v === "string" ? v : fallback;
}
function pickEnum<T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
) {
  return typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : fallback;
}
function makeId(prefix = "b") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}
function transportLabel(t?: TransportType) {
  if (!t) return "No";
  if (t === "ida") return "Solo ida";
  if (t === "vuelta") return "Solo vuelta";
  return "Ida y vuelta";
}

export default function ConfirmScreen() {
  const router = useRouter();
  const addBooking = useBookingsStore((s) => s.addBooking);
  const params = useLocalSearchParams();

  const petName = pickString(params.petName, "—");
  const petType = pickEnum<PetType>(params.petType, ["Perro", "Gato"], "Perro");

  const planId = pickEnum<PlanId>(
    params.planId,
    ["bb", "consientan", "principe"],
    "bb",
  );
  const planName = pickString(params.planName, "—");

  const careTime = pickEnum<CareTime>(params.careTime, ["day", "full"], "day");
  const careTimeLabel = pickString(params.careTimeLabel, "—");

  const city = pickString(params.city, "—");
  const dateLabel = pickString(params.dateLabel, "—");
  const totalUSD = pickString(params.totalUSD, "$0.00");

  const transportNeeded =
    pickString(params.transportNeeded, "false") === "true";
  const transportType = pickEnum<TransportType>(
    params.transportType,
    ["ida", "vuelta", "ida_vuelta"],
    "ida_vuelta",
  );

  const planIcon = useMemo(() => {
    if (planId === "bb") return "shield-check";
    if (planId === "consientan") return "heart";
    return "crown";
  }, [planId]);

  const confirmedRef = useRef(false);

  const onConfirm = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    addBooking({
      id: makeId("b"),
      petName,
      petType,
      planId,
      planName,
      careTime,
      city,
      dateLabel,
      totalUSD,
      status: "pendiente",
      createdAtISO: new Date().toISOString(),
      transportNeeded,
      transportType: transportNeeded ? transportType : undefined,
    });

    router.replace("/(tabs)");
  };

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
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            Confirmación
          </Text>

          <Text
            style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}
          >
            Revisa que todo esté perfecto. Tu peludito está por ser tratado como
            rey 👑
          </Text>

          <Card style={{ marginTop: theme.spacing(2) }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,183,77,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(255,183,77,0.25)",
                }}
              >
                <MaterialCommunityIcons
                  name={petType === "Gato" ? "cat" : "dog"}
                  size={20}
                  color={theme.colors.warn}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  PELUDITO
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {petName}
                </Text>
              </View>
            </View>

            <View style={{ height: 14 }} />

            <View style={{ gap: 10 }}>
              <Row icon={planIcon} label="Plan" value={planName} />
              <Row icon="clock-outline" label="Tiempo" value={careTimeLabel} />
              <Row icon="map-marker" label="Ciudad" value={city} />
              <Row icon="calendar" label="Fecha" value={dateLabel} />
              <Row
                icon="car"
                label="Transporte"
                value={transportNeeded ? transportLabel(transportType) : "No"}
              />
            </View>

            <View
              style={{
                marginTop: theme.spacing(2),
                paddingTop: theme.spacing(2),
                borderTopWidth: 1,
                borderTopColor: theme.colors.line,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
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
                {totalUSD}
              </Text>
            </View>
          </Card>

          <View style={{ marginTop: theme.spacing(2) }}>
            <Button title="Confirmar reserva ✅" onPress={onConfirm} />
            <View style={{ height: 10 }} />
            <Button
              title="Volver"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>

          <View style={{ height: 22 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.warn} />
      <Text style={{ color: theme.colors.muted, width: 90 }}>{label}:</Text>
      <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}
