import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { usePetsStore } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

type City = "Latacunga" | "Quito" | "Porto Viejo";
type DatePick = "Hoy" | "Mañana" | "Este sábado" | "Otra fecha";

type PlanId = "bb" | "consientan" | "principe";

type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  basePrice: number; // USD
  includes: string[];
  highlight?: string; // texto corto tipo "Más elegido"
};

const PLANS: Plan[] = [
  {
    id: "bb",
    name: "Cuíden a mi BB",
    tagline: "Cuidado esencial con amor y seguridad.",
    basePrice: 7,
    includes: [
      "Camita + sombra + descanso seguro",
      "Agua fresca permanente",
      "Comida estándar",
      "Patio / espacio de relajación",
      "Reporte básico del día",
    ],
  },
  {
    id: "consientan",
    name: "Consientan a mi peludo",
    tagline: "Más atención, paseo y evidencia para tu tranquilidad.",
    basePrice: 12,
    includes: [
      "Todo lo del plan BB",
      "Paseo con evidencia (foto/video)",
      "Baño básico",
      "Comida orgánica adaptada (tamaño/edad)",
      "Reporte detallado + fotos",
    ],
    highlight: "Recomendado",
  },
  {
    id: "principe",
    name: "Príncipe del Hogar",
    tagline: "VIP total: mimos, grooming y recogida/entrega.",
    basePrice: 22,
    includes: [
      "Todo lo del plan Consientan",
      "Snacks premium (aprobados por ti)",
      "Grooming completo / corte básico",
      "Juguetes + juegos guiados + mimos",
      "Transporte incluido (recogida/entrega)",
      "Reporte completo + video",
    ],
    highlight: "Premium",
  },
];

function moneyUSD(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "rgba(87,215,255,0.55)" : theme.colors.line,
        backgroundColor: active
          ? "rgba(87,215,255,0.14)"
          : theme.colors.surface2,
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: selected ? "rgba(87,215,255,0.55)" : theme.colors.line,
        backgroundColor: selected
          ? "rgba(87,215,255,0.10)"
          : theme.colors.surface,
        padding: theme.spacing(2),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            {plan.name}
          </Text>
          <Text
            style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}
          >
            {plan.tagline}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          {plan.highlight ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: "rgba(139,92,255,0.45)",
                backgroundColor: "rgba(139,92,255,0.18)",
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MaterialCommunityIcons
                name={plan.id === "consientan" ? "heart" : "crown"}
                size={14}
                color={theme.colors.warn}
              />
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "800",
                  fontSize: 12,
                }}
              >
                {plan.highlight}
              </Text>
            </View>
          ) : null}

          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            {moneyUSD(plan.basePrice)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: theme.spacing(2), gap: 8 }}>
        {plan.includes.slice(0, 4).map((x) => (
          <Text
            key={x}
            style={{ color: theme.colors.text, opacity: 0.92, lineHeight: 18 }}
          >
            • {x}
          </Text>
        ))}
        {plan.includes.length > 4 ? (
          <Text style={{ color: theme.colors.muted, marginTop: 2 }}>
            + {plan.includes.length - 4} beneficios más
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
function PetCard({
  pet,
  selected,
  onPress,
}: {
  pet: any;
  selected: boolean;
  onPress: () => void;
}) {
  const icon = pet.type === "Perro" ? "dog" : "cat";

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: selected ? "rgba(87,215,255,0.55)" : theme.colors.line,
        backgroundColor: selected
          ? "rgba(87,215,255,0.10)"
          : theme.colors.surface,
        padding: theme.spacing(2),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: theme.colors.surface2,
              borderWidth: 1,
              borderColor: theme.colors.line,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={22}
              color={theme.colors.text}
            />
          </View>

          <View>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
                fontSize: 16,
              }}
            >
              {pet.name}
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 2 }}>
              {pet.type} • {pet.size} • {pet.social}
            </Text>
          </View>
        </View>

        {selected ? (
          <View
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              backgroundColor: "rgba(87,215,255,0.18)",
              borderWidth: 1,
              borderColor: "rgba(87,215,255,0.45)",
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              Elegido ✅
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function Chip({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.line,
        backgroundColor: theme.colors.surface2,
      }}
    >
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.warn} />
      <View style={{ flexShrink: 1 }}>
        <Text
          style={{ color: theme.colors.muted, fontSize: 11, fontWeight: "800" }}
        >
          {label.toUpperCase()}
        </Text>
        <Text
          style={{ color: theme.colors.text, fontSize: 13, fontWeight: "900" }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function BookingsScreen() {
  const pets = usePetsStore((s) => s.pets);
  const [petId, setPetId] = useState<string | null>(null);
  const router = useRouter();

  const [city, setCity] = useState<City>("Latacunga");
  const [datePick, setDatePick] = useState<DatePick>("Hoy");
  const [planId, setPlanId] = useState<PlanId>("consientan");
  const planIcon =
    planId === "bb"
      ? "shield-check"
      : planId === "consientan"
        ? "heart"
        : "crown";
  const [careTime, setCareTime] = useState<"day" | "full" | null>(null);

  const careTimeLabel =
    careTime === "day"
      ? "Día laboral (08:30 – 18:00)"
      : careTime === "full"
        ? "24 horas (Hospedaje)"
        : "— (elige uno)";

  // Add-on opcional (MVP): revisión vet
  const [vetCheck, setVetCheck] = useState(false);
  const [brush, setBrush] = useState(false);
  const [fullGroom, setFullGroom] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const dateLabel = customDate
    ? new Intl.DateTimeFormat("es-EC", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(customDate)
    : datePick;

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === planId) ?? PLANS[0],
    [planId],
  );
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === petId) ?? null,
    [pets, petId],
  );
  const canContinue = Boolean(selectedPet) && Boolean(careTime);

  const total = useMemo(() => {
    // Ajuste por ciudad (mock)
    const cityAdj = city === "Quito" ? 1 : city === "Porto Viejo" ? 1 : 0;

    // Add-on vet (mock)
    const vet = vetCheck ? 8 : 0;

    return selectedPlan.basePrice + cityAdj + vet;
  }, [selectedPlan, city, vetCheck]);
  const today = new Date();

  function formatDateLabel() {
    const d = customDate ?? new Date();

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };

    const formatted = d.toLocaleDateString("es-EC", options);

    if (datePick === "Hoy") return `Hoy · ${formatted}`;
    if (datePick === "Mañana") return `Mañana · ${formatted}`;
    if (datePick === "Este sábado") return `Este sábado · ${formatted}`;

    // Otra fecha
    return `Otra fecha · ${formatted}`;
  }

  function addDays(base: Date, days: number) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }

  function nextSaturday(base: Date) {
    const d = new Date(base);
    const day = d.getDay(); // 0=domingo ... 6=sábado
    const diff = (6 - day + 7) % 7;
    return addDays(d, diff === 0 ? 7 : diff);
  }

  return (
    <Screen>
      <ScrollView>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Reservas
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Elige un plan y deja que cuidemos a tu peludito como se merece.
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            ¿A quién cuidamos hoy? 🥹
          </Text>

          <Text
            style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}
          >
            Elige tu peludito para armar la reserva.
          </Text>

          {pets.length === 0 ? (
            <Pressable
              onPress={() => router.push("/(tabs)/pets")}
              style={{
                marginTop: 12,
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: "rgba(87,215,255,0.35)",
                backgroundColor: "rgba(87,215,255,0.08)",
                padding: theme.spacing(2),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.surface2,
                      borderWidth: 1,
                      borderColor: theme.colors.line,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={theme.colors.warn}
                    />
                  </View>

                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    Agregar peludito
                  </Text>
                </View>

                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: theme.colors.line,
                  }}
                >
                  <MaterialCommunityIcons
                    name="paw"
                    size={20}
                    color={theme.colors.muted}
                  />
                </View>
              </View>

              <Text
                style={{
                  color: theme.colors.muted,
                  marginTop: 8,
                  lineHeight: 18,
                }}
              >
                Ñaño, regístralo rapidito para poder reservar 😄
              </Text>
            </Pressable>
          ) : (
            <View style={{ marginTop: 12, gap: 12 }}>
              {pets.map((p) => (
                <PetCard
                  key={p.id}
                  pet={p}
                  selected={petId === p.id}
                  onPress={() => setPetId(p.id)}
                />
              ))}

              <Pressable
                onPress={() => router.push("/(tabs)/pets")}
                style={{
                  borderRadius: theme.radius.xl,
                  borderWidth: 1,
                  borderColor: theme.colors.line,
                  backgroundColor: theme.colors.surface2,
                  padding: theme.spacing(2),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.surface2,
                      borderWidth: 1,
                      borderColor: theme.colors.line,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={theme.colors.warn}
                    />
                  </View>

                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    Agregar otro peludito
                  </Text>
                </View>

                <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
                  Para que ninguno se quede sin mimos 😄
                </Text>
              </Pressable>
            </View>
          )}
        </Card>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Plan
          </Text>

          <View style={{ marginTop: theme.spacing(2), gap: 12 }}>
            {PLANS.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={p.id === planId}
                onPress={() => setPlanId(p.id)}
              />
            ))}
          </View>
        </Card>
        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            ⏱️ Tiempo de cuidado
          </Text>

          <Text
            style={{
              color: theme.colors.muted,
              marginTop: 6,
              lineHeight: 18,
            }}
          >
            Elige cuánto tiempo cuidamos a tu peludito.
          </Text>

          {/* OPCIÓN DÍA */}
          <Pressable
            onPress={() => setCareTime("day")}
            style={{
              marginTop: 12,
              borderRadius: theme.radius.xl,
              padding: theme.spacing(2),
              borderWidth: 1,
              borderColor:
                careTime === "day" ? theme.colors.primary : theme.colors.line,
              backgroundColor:
                careTime === "day"
                  ? "rgba(87,215,255,0.12)"
                  : theme.colors.surface2,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              ☀️ Día laboral
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
              08:30 – 18:00 · Ideal mientras trabajas
            </Text>
          </Pressable>

          {/* OPCIÓN 24H */}
          <Pressable
            onPress={() => setCareTime("full")}
            style={{
              marginTop: 12,
              borderRadius: theme.radius.xl,
              padding: theme.spacing(2),
              borderWidth: 1,
              borderColor:
                careTime === "full" ? theme.colors.primary : theme.colors.line,
              backgroundColor:
                careTime === "full"
                  ? "rgba(87,215,255,0.12)"
                  : theme.colors.surface2,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              🌙 24 horas (Hospedaje)
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
              Incluye noche y cuidado continuo
            </Text>
          </Pressable>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Ciudad
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Pill
              label="Latacunga"
              active={city === "Latacunga"}
              onPress={() => setCity("Latacunga")}
            />
            <Pill
              label="Quito"
              active={city === "Quito"}
              onPress={() => setCity("Quito")}
            />
            <Pill
              label="Porto Viejo"
              active={city === "Porto Viejo"}
              onPress={() => setCity("Porto Viejo")}
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
            Fecha
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Pill
              label="Hoy"
              active={datePick === "Hoy"}
              onPress={() => {
                setDatePick("Hoy");
                setCustomDate(new Date());
                setShowPicker(false);
              }}
            />
            <Pill
              label="Mañana"
              active={datePick === "Mañana"}
              onPress={() => {
                setDatePick("Mañana");
                setCustomDate(addDays(new Date(), 1));
                setShowPicker(false);
              }}
            />
            <Pill
              label="Este sábado"
              active={datePick === "Este sábado"}
              onPress={() => {
                setDatePick("Este sábado");
                setCustomDate(nextSaturday(new Date()));
                setShowPicker(false);
              }}
            />
            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                marginTop: 12,
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface2,
                padding: theme.spacing(2),
              }}
            >
              <Modal visible={showPicker} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.74)",
                      padding: theme.spacing(2),
                      justifyContent: "flex-end",
                      paddingBottom: 90, // 👈 SUBE el sheet (aprox 15–20%)
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderRadius: theme.radius.xl,
                          borderWidth: 1,
                          borderColor: theme.colors.line,
                          padding: theme.spacing(2),
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              fontSize: 16,
                            }}
                          >
                            Elegir fecha
                          </Text>

                          <Pressable
                            onPress={() => setShowPicker(false)}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 999,
                              borderWidth: 1,
                              borderColor: theme.colors.line,
                              backgroundColor: theme.colors.surface2,
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "800",
                              }}
                            >
                              Listo
                            </Text>
                          </Pressable>
                        </View>

                        <DateTimePicker
                          value={customDate ?? new Date()}
                          mode="date"
                          display={Platform.OS === "ios" ? "inline" : "default"}
                          onChange={(_, selected) => {
                            if (selected) {
                              setCustomDate(selected);
                              setDatePick("Otra fecha");
                            }
                            if (Platform.OS !== "ios") setShowPicker(false);
                          }}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                📅 Elegir otra fecha
              </Text>

              <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                {customDate
                  ? `Seleccionada: ${formatDateLabel()}`
                  : "Si no es hoy/mañana/sábado, elige aquí"}
              </Text>
            </Pressable>
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
            Add-ons (opcional)
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: theme.colors.line,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "700",
                flex: 1,
                paddingRight: 12,
              }}
            >
              Revisión veterinaria (aliado)
            </Text>
            <Switch value={vetCheck} onValueChange={setVetCheck} />
          </View>

          <Text
            style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 18 }}
          >
            * Ideal si tu peludito está sensible, ansioso o quieres una
            evaluación rápida.
          </Text>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Resumen
          </Text>

          {/* Header: Peludito + icon */}
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                backgroundColor: theme.colors.surface2,
                borderWidth: 1,
                borderColor: theme.colors.line,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={selectedPet?.type === "Perro" ? "dog" : "cat"}
                size={22}
                color={theme.colors.warn}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontWeight: "800",
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
                {selectedPet ? selectedPet.name : "— elige uno"}
              </Text>
            </View>
          </View>

          {/* Chips */}
          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Chip
                icon={planIcon as any}
                label="Plan"
                value={selectedPlan.name}
              />

              <Chip icon="clock-outline" label="Tiempo" value={careTimeLabel} />
            </View>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Chip icon="map-marker" label="Ciudad" value={city} />
              <Chip icon="calendar" label="Fecha" value={formatDateLabel()} />
            </View>
          </View>

          {/* Total */}
          <View
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: theme.colors.line,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: theme.colors.muted, fontWeight: "900" }}>
              TOTAL ESTIMADO
            </Text>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "900",
                fontSize: 20,
              }}
            >
              {moneyUSD(total)}
            </Text>
          </View>

          {/* Continuar */}
          <View style={{ marginTop: 14 }}>
            <Button
              title={canContinue ? "Continuar" : "Elige peludito + tiempo 🐾"}
              disabled={!canContinue}
              onPress={() => {
                if (!canContinue) return;
                if (!selectedPet || !selectedPlan || !careTime) return;

                router.push({
                  pathname: "/confirm",
                  params: {
                    petName: selectedPet.name,
                    petType: selectedPet.type, // "Perro" | "Gato"
                    planId: planId, // "bb" | "consientan" | "principe"
                    planName: selectedPlan.name,
                    careTime: careTime, // "day" | "full"
                    careTimeLabel: careTimeLabel,
                    city,
                    dateLabel: formatDateLabel(),
                    totalUSD: moneyUSD(total),
                  },
                });
              }}
            />
          </View>

          {!canContinue ? (
            <Text
              style={{
                color: theme.colors.warn,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              Ñaño… primero elige a tu peludito y el tiempo 😄
            </Text>
          ) : null}
        </Card>

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
