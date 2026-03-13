import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  canRegisterBookingCareEvents,
  getBookingCareEventDefinition,
  getBookingCareEventDefinitions,
  getBookingCareGateMessage,
  getBookingQrPhaseLabel,
  getTimelineEventIcon,
  getTimelineEventLabel,
  validateBookingCareEventDraft,
  type BookingCareEventType,
} from "../src/domain/bookings";
import { useBookingsStore } from "../src/store/bookingsStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { Screen } from "../src/ui/Screen";

function formatCreatedAt(iso?: string) {
  if (!iso) return "-";

  try {
    const date = new Date(iso);
    return date.toLocaleString("es-EC", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function EventTypeTile({
  type,
  selected,
  onToggle,
}: {
  type: BookingCareEventType;
  selected: boolean;
  onToggle: () => void;
}) {
  const definition = getBookingCareEventDefinition(type);

  return (
    <View
      style={{
        width: "50%",
        paddingHorizontal: 5,
        paddingBottom: 10,
      }}
    >
      <Pressable
        onPress={onToggle}
        style={{
          minHeight: 82,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: selected ? "rgba(87,215,255,0.52)" : theme.colors.line,
          backgroundColor: selected
            ? "rgba(87,215,255,0.16)"
            : theme.colors.surface2,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected
                ? "rgba(87,215,255,0.20)"
                : "rgba(255,255,255,0.06)",
            }}
          >
            <MaterialCommunityIcons
              name={getTimelineEventIcon(type) as any}
              size={17}
              color={theme.colors.warn}
            />
          </View>

          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected
                ? "rgba(87,215,255,0.18)"
                : "rgba(255,255,255,0.06)",
              borderWidth: selected ? 1 : 0,
              borderColor: selected ? "rgba(87,215,255,0.30)" : "transparent",
            }}
          >
            <MaterialCommunityIcons
              name={selected ? "check" : "plus"}
              size={13}
              color={selected ? theme.colors.text : theme.colors.muted}
            />
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={{
            color: theme.colors.text,
            fontWeight: "900",
            marginTop: 12,
            fontSize: 13,
            lineHeight: 16,
          }}
        >
          {definition.label}
        </Text>
      </Pressable>
    </View>
  );
}

function TimelinePreviewRow({
  type,
  createdAtISO,
  note,
}: {
  type: string;
  createdAtISO: string;
  note?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(87,215,255,0.12)",
          borderWidth: 1,
          borderColor: "rgba(87,215,255,0.34)",
        }}
      >
        <MaterialCommunityIcons
          name={getTimelineEventIcon(type as any) as any}
          size={15}
          color={theme.colors.warn}
        />
      </View>

      <View style={{ flex: 1, paddingTop: 2 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {getTimelineEventLabel(type as any)}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>
          {formatCreatedAt(createdAtISO)}
        </Text>
        {note ? (
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{note}</Text>
        ) : null}
      </View>
    </View>
  );
}

function MetaPill({
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
        flex: 1,
        minWidth: 130,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.line,
        backgroundColor: theme.colors.surface2,
        padding: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name={icon} size={16} color={theme.colors.warn} />
        <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: theme.colors.text, fontWeight: "900", marginTop: 8 }}>
        {value}
      </Text>
    </View>
  );
}

export default function BookingCareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";
  const bookings = useBookingsStore((state) => state.bookings);
  const addTimelineEvent = useBookingsStore((state) => state.addTimelineEvent);

  const booking = useMemo(
    () => bookings.find((item) => item.id === bookingId),
    [bookings, bookingId],
  );
  const [selectedType, setSelectedType] = useState<BookingCareEventType | null>(null);
  const [note, setNote] = useState("");

  const goToHistory = () => router.replace("/(tabs)/history");

  if (!booking) {
    return (
      <Screen>
        <View style={{ flex: 1, padding: theme.spacing(2), gap: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
            Registrar cuidado
          </Text>
          <Card>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              Reserva no encontrada
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
              No pudimos abrir el registro de cuidados para esta reserva.
            </Text>
          </Card>
          <Button title="Volver al historial" onPress={goToHistory} />
        </View>
      </Screen>
    );
  }

  const canRegister = canRegisterBookingCareEvents(booking.qr.phase);
  const selectedDefinition = selectedType
    ? getBookingCareEventDefinition(selectedType)
    : null;
  const recentEvents = [...booking.timeline].slice(-5).reverse();
  const registrationPreview = formatCreatedAt(new Date().toISOString());

  const onSave = () => {
    if (!selectedType || !canRegister) return;

    const validation = validateBookingCareEventDraft({
      type: selectedType,
      note,
    });

    if (!validation.ok) {
      Alert.alert("Falta informacion", validation.error);
      return;
    }

    addTimelineEvent(booking.id, {
      type: selectedType,
      actor: "caregiver",
      note: validation.note,
    });

    setSelectedType(null);
    setNote("");
    Alert.alert("Evento registrado", "El cuidado se agrego al timeline local.");
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={goToHistory}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.line,
                backgroundColor: theme.colors.surface,
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color={theme.colors.text} />
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Historial</Text>
            </Pressable>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: canRegister
                  ? "rgba(34,197,94,0.38)"
                  : "rgba(255,255,255,0.10)",
                backgroundColor: canRegister
                  ? "rgba(34,197,94,0.14)"
                  : theme.colors.surface,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 12 }}>
                Cuidado local
              </Text>
            </View>
          </View>

          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900", marginTop: 18 }}>
            Registrar cuidado
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}>
            Captura eventos reales del cuidado con una vista mas clara y lista para operar desde el movil.
          </Text>

          <Card style={{ marginTop: theme.spacing(2) }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,183,77,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(255,183,77,0.25)",
                }}
              >
                <MaterialCommunityIcons
                  name={booking.petType === "Perro" ? "dog" : "cat"}
                  size={24}
                  color={theme.colors.warn}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 20 }}>
                  {booking.petName}
                </Text>
                <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                  {booking.planName}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
              <MetaPill
                icon="calendar"
                label="Servicio"
                value={`${booking.city} - ${booking.dateLabel}`}
              />
              <MetaPill
                icon="qrcode"
                label="Estado QR"
                value={getBookingQrPhaseLabel(booking.qr.phase)}
              />
            </View>

            <View
              style={{
                marginTop: 14,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: canRegister
                  ? "rgba(34,197,94,0.32)"
                  : "rgba(255,255,255,0.08)",
                backgroundColor: canRegister
                  ? "rgba(34,197,94,0.08)"
                  : theme.colors.surface2,
                padding: 14,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                Estado operativo
              </Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 18, marginTop: 6 }}>
                {getBookingCareGateMessage(booking.qr.phase)}
              </Text>
            </View>
          </Card>

          {canRegister ? (
            <Card style={{ marginTop: theme.spacing(2) }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Tipo de evento
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}>
                Elige un tipo de evento para preparar el registro en el panel inferior.
              </Text>

              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginHorizontal: -5,
                }}
              >
                {getBookingCareEventDefinitions().map((definition) => (
                  <EventTypeTile
                    key={definition.type}
                    type={definition.type}
                    selected={selectedType === definition.type}
                    onToggle={() =>
                      setSelectedType((current) =>
                        current === definition.type ? null : definition.type,
                      )
                    }
                  />
                ))}
              </View>

              {selectedDefinition ? (
                <View
                  style={{
                    marginTop: 12,
                    borderRadius: theme.radius.lg,
                    borderWidth: 1,
                    borderColor: "rgba(87,215,255,0.28)",
                    backgroundColor: theme.colors.surface2,
                    padding: 16,
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(87,215,255,0.12)",
                          borderWidth: 1,
                          borderColor: "rgba(87,215,255,0.30)",
                        }}
                      >
                        <MaterialCommunityIcons
                          name={getTimelineEventIcon(selectedDefinition.type) as any}
                          size={18}
                          color={theme.colors.warn}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                            fontSize: 16,
                          }}
                        >
                          {selectedDefinition.label}
                        </Text>
                        <Text
                          style={{
                            color: theme.colors.muted,
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                        >
                          {selectedDefinition.description}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => {
                        setSelectedType(null);
                        setNote("");
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: theme.colors.line,
                        backgroundColor: theme.colors.surface,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={16}
                        color={theme.colors.muted}
                      />
                    </Pressable>
                  </View>

                  {selectedDefinition.helperText ? (
                    <Text style={{ color: theme.colors.muted, marginTop: 12, lineHeight: 18 }}>
                      {selectedDefinition.helperText}
                    </Text>
                  ) : null}

                  <Text style={{ color: theme.colors.muted, marginTop: 14, lineHeight: 18 }}>
                    {selectedDefinition.noteLabel}
                  </Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    multiline
                    placeholder={selectedDefinition.notePlaceholder}
                    placeholderTextColor={theme.colors.muted}
                    textAlignVertical="top"
                    style={{
                      marginTop: 10,
                      minHeight: 110,
                      borderWidth: 1,
                      borderColor: theme.colors.line,
                      borderRadius: theme.radius.xl,
                      paddingHorizontal: 14,
                      paddingVertical: 14,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surface,
                    }}
                  />

                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color={theme.colors.warn}
                    />
                    <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                      Se registrara ahora:{" "}
                      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                        {registrationPreview}
                      </Text>
                    </Text>
                  </View>

                  <View style={{ marginTop: 16 }}>
                    <Button title="Registrar evento" variant="success" onPress={onSave} />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title="Limpiar seleccion"
                      variant="ghost"
                      onPress={() => {
                        setSelectedType(null);
                        setNote("");
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    marginTop: 12,
                    borderRadius: theme.radius.lg,
                    borderWidth: 1,
                    borderColor: theme.colors.line,
                    backgroundColor: theme.colors.surface2,
                    padding: 14,
                  }}
                >
                  <Text style={{ color: theme.colors.muted, lineHeight: 18 }}>
                    Selecciona una accion para ver su contexto, escribir la nota y registrarla abajo.
                  </Text>
                </View>
              )}
            </Card>
          ) : (
            <Card style={{ marginTop: theme.spacing(2) }}>
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
                Registro bloqueado
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
                Esta pantalla solo acepta eventos cuando la reserva ya completo el check-in local.
              </Text>
              <View style={{ marginTop: 14 }}>
                <Button title="Ver QR" variant="secondary" onPress={() =>
                  router.replace({
                    pathname: "/booking-qr",
                    params: { bookingId: booking.id },
                  })
                } />
              </View>
              <View style={{ marginTop: 10 }}>
                <Button title="Volver al historial" variant="ghost" onPress={goToHistory} />
              </View>
            </Card>
          )}

          <Card style={{ marginTop: theme.spacing(2) }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
                Timeline reciente
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                {recentEvents.length} evento(s)
              </Text>
            </View>

            <View style={{ marginTop: 12, gap: 12 }}>
              {recentEvents.map((event) => (
                <TimelinePreviewRow
                  key={event.id}
                  type={event.type}
                  createdAtISO={event.createdAtISO}
                  note={event.note}
                />
              ))}
            </View>

            <Text style={{ color: theme.colors.muted, marginTop: 12, fontSize: 12 }}>
              Ultima actualizacion: {formatCreatedAt(booking.timeline.at(-1)?.createdAtISO)}
            </Text>
          </Card>

          <View style={{ marginTop: theme.spacing(2) }}>
            <Button title="Volver al historial" variant="ghost" onPress={goToHistory} />
          </View>

          <View style={{ height: 22 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}
