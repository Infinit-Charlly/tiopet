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

import {
  calculateBookingTotal,
  CITY_OPTIONS,
  CUSTOM_DATE_PICK,
  DATE_PICK_OPTIONS,
  formatBookingDateLabel,
  getCareTimeLabel,
  getDateForPresetPick,
  getPlanById,
  getPlanHighlightIcon,
  getPlanIcon,
  getTransportLabel,
  moneyUSD,
  PLANS,
  TRANSPORT_OPTIONS,
  type CareTime,
  type City,
  type DatePick,
  type Plan,
  type PlanId,
  type TransportType,
} from "../../src/domain/bookings";
import { usePetsStore, type Pet } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

function Pill({
  label,
  active,
  onPress,
  accentBorder,
  accentBg,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accentBorder: string;
  accentBg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? accentBorder : theme.colors.line,
        backgroundColor: active ? accentBg : theme.colors.surface2,
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
  accentBorder,
  accentBg,
}: {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
  accentBorder: string;
  accentBg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: selected ? accentBorder : theme.colors.line,
        backgroundColor: selected ? accentBg : theme.colors.surface,
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
                name={getPlanHighlightIcon(plan.id)}
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
  accentBorder,
  accentBg,
}: {
  pet: Pet;
  selected: boolean;
  onPress: () => void;
  accentBorder: string;
  accentBg: string;
}) {
  const icon = pet.type === "Perro" ? "dog" : "cat";

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: selected ? accentBorder : theme.colors.line,
        backgroundColor: selected ? accentBg : theme.colors.surface,
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
              backgroundColor: accentBg,
              borderWidth: 1,
              borderColor: accentBorder,
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
  const router = useRouter();

  const [petId, setPetId] = useState<string | null>(null);

  const [city, setCity] = useState<City>("Latacunga");
  const [datePick, setDatePick] = useState<DatePick>("Hoy");
  const [planId, setPlanId] = useState<PlanId>("consientan");
  const [careTime, setCareTime] = useState<CareTime | null>(null);

  // ✅ Transporte (MVP) — dentro del componente (NO redeclare)
  const [transportNeeded, setTransportNeeded] = useState(false);
  const [transportType, setTransportType] =
    useState<TransportType>("ida_vuelta");

  // Add-on opcional (MVP): revisión vet
  const [vetCheck, setVetCheck] = useState(false);

  // fecha picker
  const [customDate, setCustomDate] = useState<Date | null>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const planIcon = getPlanIcon(planId);
  const careTimeLabel = getCareTimeLabel(careTime);
  const dateLabel = formatBookingDateLabel(datePick, customDate);

  const selectedPlan = useMemo(() => getPlanById(planId), [planId]);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === petId) ?? null,
    [pets, petId],
  );

  const accent = useMemo(() => {
    const dog = {
      border: "rgba(87,215,255,0.55)",
      bg: "rgba(87,215,255,0.14)",
    };
    const cat = {
      border: "rgba(244,114,182,0.55)",
      bg: "rgba(244,114,182,0.14)",
    };
    if (!selectedPet) return dog;
    return selectedPet.type === "Gato" ? cat : dog;
  }, [selectedPet]);

  const canContinue = Boolean(selectedPet) && Boolean(careTime);

  const total = useMemo(() => {
    return calculateBookingTotal({
      basePrice: selectedPlan.basePrice,
      city,
      vetCheck,
      transportNeeded,
      transportType,
    });
  }, [selectedPlan, city, vetCheck, transportNeeded, transportType]);

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

        {/* Peludito */}
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
                borderColor: accent.border,
                backgroundColor: accent.bg,
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
                  accentBorder={accent.border}
                  accentBg={accent.bg}
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

        {/* Plan */}
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
                accentBorder={accent.border}
                accentBg={accent.bg}
              />
            ))}
          </View>
        </Card>

        {/* Tiempo */}
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
            style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}
          >
            Elige cuánto tiempo cuidamos a tu peludito.
          </Text>

          <Pressable
            onPress={() => setCareTime("day")}
            style={{
              marginTop: 12,
              borderRadius: theme.radius.xl,
              padding: theme.spacing(2),
              borderWidth: 1,
              borderColor:
                careTime === "day" ? accent.border : theme.colors.line,
              backgroundColor:
                careTime === "day" ? accent.bg : theme.colors.surface2,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              ☀️ Día laboral
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
              08:30 – 18:00 · Ideal mientras trabajas
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setCareTime("full")}
            style={{
              marginTop: 12,
              borderRadius: theme.radius.xl,
              padding: theme.spacing(2),
              borderWidth: 1,
              borderColor:
                careTime === "full" ? accent.border : theme.colors.line,
              backgroundColor:
                careTime === "full" ? accent.bg : theme.colors.surface2,
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

        {/* Transporte MVP */}
        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            🚗 Transporte (MVP)
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
              ¿Necesitas transporte?
            </Text>
            <Switch
              value={transportNeeded}
              onValueChange={setTransportNeeded}
            />
          </View>

          {transportNeeded ? (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {TRANSPORT_OPTIONS.map((option) => (
                <Pill
                  key={option.value}
                  label={option.label}
                  active={transportType === option.value}
                  onPress={() => setTransportType(option.value)}
                  accentBorder={accent.border}
                  accentBg={accent.bg}
                />
              ))}
            </View>
          ) : null}

          <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
            {"* Luego lo hacemos pro con horarios + dirección + precio."}
          </Text>
        </Card>

        {/* Ciudad */}
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
            {CITY_OPTIONS.map((option) => (
              <Pill
                key={option}
                label={option}
                active={city === option}
                onPress={() => setCity(option)}
                accentBorder={accent.border}
                accentBg={accent.bg}
              />
            ))}
          </View>
        </Card>

        {/* Fecha */}
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
            {DATE_PICK_OPTIONS.map((option) => (
              <Pill
                key={option}
                label={option}
                active={datePick === option}
                onPress={() => {
                  setDatePick(option);
                  setCustomDate(getDateForPresetPick(option));
                }}
                accentBorder={accent.border}
                accentBg={accent.bg}
              />
            ))}

            <Pressable
              onPress={() => {
                setDatePick(CUSTOM_DATE_PICK);
                setShowPicker(true);
              }}
              style={{
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface2,
                padding: theme.spacing(2),
                flexGrow: 1,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                {"📅 Elegir otra fecha"}
              </Text>

              <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                {customDate
                  ? "Seleccionada: " + dateLabel
                  : "Si no es hoy/mañana/sábado, elige aquí"}
              </Text>
            </Pressable>
          </View>

          <Modal visible={showPicker} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.74)",
                  padding: theme.spacing(2),
                  justifyContent: "flex-end",
                  paddingBottom: 90,
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
                        if (selected) setCustomDate(selected);
                        if (Platform.OS !== "ios") setShowPicker(false);
                      }}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </Card>

        {/* Add-ons */}
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

        {/* Resumen */}
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
              <Chip icon="calendar" label="Fecha" value={dateLabel} />
            </View>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Chip
                icon="car"
                label="Transporte"
                value={getTransportLabel(transportNeeded, transportType)}
              />
            </View>
          </View>

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
                    petType: selectedPet.type,
                    planId,
                    planName: selectedPlan.name,
                    careTime,
                    careTimeLabel,
                    city,
                    dateLabel,
                    totalUSD: moneyUSD(total),
                    transportNeeded: String(transportNeeded),
                    transportType,
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
