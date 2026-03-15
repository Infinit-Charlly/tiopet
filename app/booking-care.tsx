import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  canMutateTimelineEvent,
  canRegisterBookingCareEvents,
  getBookingCareEventDefinition,
  getBookingCareEventDefinitions,
  getBookingCareGateMessage,
  getBookingQrPhaseLabel,
  getTimelineEventIcon,
  sortTimelineEventsDescending,
  getTimelineEventLabel,
  validateBookingCareEventDraft,
  type BookingCareEventType,
  type CareTimelineEvent,
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

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateInputValue(iso?: string) {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function formatTimeInputValue(iso?: string) {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function buildEditedCreatedAtISO(dateValue: string, timeValue: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue.trim());

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const nextDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    Number.isNaN(nextDate.getTime()) ||
    nextDate.getFullYear() !== year ||
    nextDate.getMonth() !== month - 1 ||
    nextDate.getDate() !== day
  ) {
    return null;
  }

  return nextDate.toISOString();
}

function getMutationErrorMessage(reason: string) {
  switch (reason) {
    case "booking_not_found":
      return "No encontramos la reserva para actualizar este evento.";
    case "event_not_found":
      return "No encontramos ese evento dentro del timeline local.";
    case "event_not_mutable":
      return "Ese evento no se puede editar ni eliminar.";
    case "invalid_type":
      return "El tipo de evento seleccionado no es valido para edicion.";
    case "invalid_note":
      return "Revisa la nota antes de guardar los cambios.";
    case "invalid_created_at":
      return "Revisa la fecha y la hora antes de guardar los cambios.";
    case "before_check_in":
      return "El evento no puede registrarse antes del check-in local de la reserva.";
    case "after_check_out":
      return "El evento no puede quedar despues del check-out local de la reserva.";
    case "in_future":
      return "Si la reserva no tiene check-out, el evento no puede quedar en el futuro.";
    default:
      return "No pudimos completar la accion sobre el evento.";
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
  event,
  canManage,
  isEditing,
  onEdit,
  onDelete,
}: {
  event: CareTimelineEvent;
  canManage: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: isEditing ? "rgba(87,215,255,0.32)" : theme.colors.line,
        backgroundColor: isEditing ? "rgba(87,215,255,0.08)" : theme.colors.surface2,
        padding: 12,
      }}
    >
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
            name={getTimelineEventIcon(event.type) as any}
            size={15}
            color={theme.colors.warn}
          />
        </View>

        <View style={{ flex: 1, paddingTop: 2 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
              {getTimelineEventLabel(event.type)}
            </Text>
            {isEditing ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(87,215,255,0.30)",
                  backgroundColor: "rgba(87,215,255,0.14)",
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "800" }}>
                  Editando
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>
            {formatCreatedAt(event.createdAtISO)}
          </Text>

          {event.note ? (
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{event.note}</Text>
          ) : null}

          {canManage ? (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={onEdit}
                style={{
                  flex: 1,
                  minHeight: 38,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: "rgba(87,215,255,0.28)",
                  backgroundColor: "rgba(87,215,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  {isEditing ? "Seguir editando" : "Editar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={onDelete}
                style={{
                  flex: 1,
                  minHeight: 38,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.32)",
                  backgroundColor: "rgba(239,68,68,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Eliminar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
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

function InlinePickerActionButton({
  icon,
  label,
  value,
  active,
  dimmed,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  active: boolean;
  dimmed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 62,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: active
          ? "rgba(87,215,255,0.48)"
          : dimmed
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.12)",
        backgroundColor: active
          ? "rgba(87,215,255,0.12)"
          : dimmed
            ? "rgba(255,255,255,0.025)"
            : "rgba(255,255,255,0.04)",
        paddingHorizontal: 14,
        paddingVertical: 12,
        justifyContent: "center",
        shadowColor: active ? "rgba(87,215,255,0.42)" : "transparent",
        shadowOpacity: active ? 0.18 : 0,
        shadowRadius: active ? 14 : 0,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? "rgba(87,215,255,0.16)" : "rgba(255,255,255,0.06)",
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={active ? theme.colors.text : theme.colors.muted}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ color: theme.colors.text, fontWeight: "900", fontSize: 13 }}
          >
            {label}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: active ? theme.colors.text : theme.colors.muted,
              marginTop: 5,
              fontSize: 12,
            }}
          >
            {value}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function BookingCareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";
  const bookings = useBookingsStore((state) => state.bookings);
  const addTimelineEvent = useBookingsStore((state) => state.addTimelineEvent);
  const updateTimelineEvent = useBookingsStore((state) => state.updateTimelineEvent);
  const deleteTimelineEvent = useBookingsStore((state) => state.deleteTimelineEvent);

  const booking = useMemo(
    () => bookings.find((item) => item.id === bookingId),
    [bookings, bookingId],
  );
  const [selectedType, setSelectedType] = useState<BookingCareEventType | null>(null);
  const [note, setNote] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDateValue, setEventDateValue] = useState("");
  const [eventTimeValue, setEventTimeValue] = useState("");
  const [mobilePickerMode, setMobilePickerMode] = useState<"date" | "time" | null>(null);

  const goToHistory = () => router.replace("/(tabs)/history");

  const editingEvent = useMemo(() => {
    if (!booking || !editingEventId) return null;
    return booking.timeline.find((event) => event.id === editingEventId) ?? null;
  }, [booking, editingEventId]);

  const resetComposer = () => {
    setEditingEventId(null);
    setSelectedType(null);
    setNote("");
    setEventDateValue("");
    setEventTimeValue("");
    setMobilePickerMode(null);
  };

  useEffect(() => {
    if (editingEventId && (!editingEvent || !canMutateTimelineEvent(editingEvent))) {
      resetComposer();
    }
  }, [editingEventId, editingEvent]);

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
  const isEditMode = editingEvent !== null;
  const selectedDefinition = selectedType
    ? getBookingCareEventDefinition(selectedType)
    : null;
  const recentEvents = sortTimelineEventsDescending(booking.timeline).slice(0, 5);
  const draftEditedCreatedAtISO = isEditMode
    ? buildEditedCreatedAtISO(eventDateValue, eventTimeValue)
    : null;
  const selectedTimestampSummary = isEditMode
    ? draftEditedCreatedAtISO
      ? formatCreatedAt(draftEditedCreatedAtISO)
      : "Fecha u hora invalida"
    : formatCreatedAt(new Date().toISOString());
  const isDatePickerActive = mobilePickerMode === "date";
  const isTimePickerActive = mobilePickerMode === "time";
  const isAnyMobilePickerActive = mobilePickerMode !== null;
  const registrationPreview = isEditMode
    ? draftEditedCreatedAtISO
      ? selectedTimestampSummary
      : formatCreatedAt(editingEvent.createdAtISO)
    : formatCreatedAt(new Date().toISOString());

  const startEditing = (event: CareTimelineEvent) => {
    if (!canRegister || !canMutateTimelineEvent(event)) return;

    setEditingEventId(event.id);
    setSelectedType(event.type as BookingCareEventType);
    setNote(event.note ?? "");
    setEventDateValue(formatDateInputValue(event.createdAtISO));
    setEventTimeValue(formatTimeInputValue(event.createdAtISO));
  };

  const onNativeDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS !== "ios") {
      setMobilePickerMode(null);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    setEventDateValue(formatDateInputValue(selectedDate.toISOString()));
  };

  const onNativeTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS !== "ios") {
      setMobilePickerMode(null);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    setEventTimeValue(formatTimeInputValue(selectedDate.toISOString()));
  };

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

    if (isEditMode && editingEvent) {
      const nextCreatedAtISO = buildEditedCreatedAtISO(eventDateValue, eventTimeValue);

      if (!nextCreatedAtISO) {
        Alert.alert(
          "Fecha invalida",
          "Revisa la fecha y la hora para guardar el evento local.",
        );
        return;
      }

      const result = updateTimelineEvent(booking.id, editingEvent.id, {
        type: selectedType,
        note: validation.note ?? "",
        createdAtISO: nextCreatedAtISO,
      });

      if (!result.ok) {
        Alert.alert("No se pudo actualizar", getMutationErrorMessage(result.reason));
        return;
      }

      resetComposer();
      Alert.alert("Evento actualizado", "El cuidado se actualizo en el timeline local.");
      return;
    }

    const result = addTimelineEvent(booking.id, {
      type: selectedType,
      actor: "caregiver",
      note: validation.note,
    });

    if (!result.ok) {
      Alert.alert("No se pudo registrar", getMutationErrorMessage(result.reason));
      return;
    }

    resetComposer();
    Alert.alert("Evento registrado", "El cuidado se agrego al timeline local.");
  };

  const confirmDeleteEvent = (event: CareTimelineEvent) => {
    if (!canRegister || !canMutateTimelineEvent(event)) return;

    Alert.alert(
      "Eliminar evento",
      "Esta accion quitara el evento del timeline local. Quieres continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const result = deleteTimelineEvent(booking.id, event.id);

            if (!result.ok) {
              Alert.alert("No se pudo eliminar", getMutationErrorMessage(result.reason));
              return;
            }

            if (editingEventId === event.id) {
              resetComposer();
            }

            Alert.alert("Evento eliminado", "El evento se quito del timeline local.");
          },
        },
      ],
    );
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
            {isEditMode ? "Editar cuidado" : "Registrar cuidado"}
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}>
            {isEditMode
              ? "Ajusta el evento seleccionado sin salir del panel operativo y manteniendo su trazabilidad local."
              : "Captura eventos reales del cuidado con una vista mas clara y lista para operar desde el movil."}
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 16,
                    }}
                  >
                    {isEditMode ? "Editar evento" : "Tipo de evento"}
                  </Text>
                  <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}>
                    {isEditMode
                      ? "Reutiliza el mismo panel para corregir tipo, nota o la hora del evento seleccionado."
                      : "Elige un tipo de evento para preparar el registro en el panel inferior."}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: isEditMode
                      ? "rgba(87,215,255,0.32)"
                      : "rgba(255,255,255,0.10)",
                    backgroundColor: isEditMode
                      ? "rgba(87,215,255,0.12)"
                      : theme.colors.surface,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 12 }}>
                    {isEditMode ? "Modo edicion" : "Modo registro"}
                  </Text>
                </View>
              </View>

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
                      onPress={resetComposer}
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

                  {isEditMode ? (
                    <View
                      style={{
                        marginTop: 12,
                        borderRadius: theme.radius.md,
                        borderWidth: 1,
                        borderColor: "rgba(87,215,255,0.24)",
                        backgroundColor: "rgba(87,215,255,0.08)",
                        padding: 12,
                        gap: 12,
                      }}
                    >
                      <View>
                        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                          Fecha y hora del evento
                        </Text>
                        <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}>
                          Corrige el momento real del cuidado para mantener el timeline en orden.
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        <View
                          style={{
                            flex: 1,
                            minWidth: 150,
                            borderRadius: theme.radius.md,
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.10)",
                            backgroundColor: theme.colors.surface,
                            padding: 12,
                          }}
                        >
                          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                            Actual
                          </Text>
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 6,
                            }}
                          >
                            {formatCreatedAt(editingEvent.createdAtISO)}
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            minWidth: 150,
                            borderRadius: theme.radius.md,
                            borderWidth: 1,
                            borderColor: draftEditedCreatedAtISO
                              ? "rgba(87,215,255,0.30)"
                              : "rgba(239,68,68,0.32)",
                            backgroundColor: draftEditedCreatedAtISO
                              ? "rgba(87,215,255,0.12)"
                              : "rgba(239,68,68,0.10)",
                            padding: 12,
                          }}
                        >
                          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                            Nuevo
                          </Text>
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 6,
                            }}
                          >
                            {selectedTimestampSummary}
                          </Text>
                        </View>
                      </View>

                      {Platform.OS === "web" ? (
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                              Fecha
                            </Text>
                            <TextInput
                              value={eventDateValue}
                              onChangeText={setEventDateValue}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholder="AAAA-MM-DD"
                              placeholderTextColor={theme.colors.muted}
                              style={{
                                minHeight: 50,
                                borderWidth: 1,
                                borderColor: theme.colors.line,
                                borderRadius: theme.radius.xl,
                                paddingHorizontal: 14,
                                color: theme.colors.text,
                                backgroundColor: theme.colors.surface,
                              }}
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                              Hora
                            </Text>
                            <TextInput
                              value={eventTimeValue}
                              onChangeText={setEventTimeValue}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholder="HH:MM"
                              placeholderTextColor={theme.colors.muted}
                              style={{
                                minHeight: 50,
                                borderWidth: 1,
                                borderColor: theme.colors.line,
                                borderRadius: theme.radius.xl,
                                paddingHorizontal: 14,
                                color: theme.colors.text,
                                backgroundColor: theme.colors.surface,
                              }}
                            />
                          </View>
                        </View>
                                            ) : (
                        <View
                          style={{
                            gap: 12,
                          }}
                        >
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <InlinePickerActionButton
                              icon="calendar-month-outline"
                              label="Editar fecha"
                              value={eventDateValue || "Seleccionar fecha"}
                              active={isDatePickerActive}
                              dimmed={isAnyMobilePickerActive && !isDatePickerActive}
                              onPress={() => setMobilePickerMode("date")}
                            />
                            <InlinePickerActionButton
                              icon="clock-time-four-outline"
                              label="Editar hora"
                              value={eventTimeValue || "Seleccionar hora"}
                              active={isTimePickerActive}
                              dimmed={isAnyMobilePickerActive && !isTimePickerActive}
                              onPress={() => setMobilePickerMode("time")}
                            />
                          </View>

                          <View
                            style={{
                              borderRadius: theme.radius.xl,
                              borderWidth: 1,
                              borderColor: isAnyMobilePickerActive
                                ? "rgba(87,215,255,0.24)"
                                : "rgba(255,255,255,0.08)",
                              backgroundColor: isAnyMobilePickerActive
                                ? "rgba(7,10,18,0.98)"
                                : "rgba(255,255,255,0.025)",
                              padding: isAnyMobilePickerActive ? 16 : 14,
                              gap: 14,
                              overflow: "hidden",
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
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.colors.text, fontWeight: "900" }}>
                                  {mobilePickerMode === "date"
                                    ? "Editar fecha del evento"
                                    : mobilePickerMode === "time"
                                      ? "Editar hora del evento"
                                      : "Actualizacion del evento"}
                                </Text>
                                <Text style={{ color: theme.colors.muted, lineHeight: 18, marginTop: 4 }}>
                                  {mobilePickerMode === "date"
                                    ? "Selecciona la fecha y pulsa Listo."
                                    : mobilePickerMode === "time"
                                      ? "Selecciona la hora y pulsa Listo."
                                      : "Pulsa una accion para ajustar el evento."}
                                </Text>
                              </View>

                              {isAnyMobilePickerActive ? (
                                <Pressable
                                  onPress={() => setMobilePickerMode(null)}
                                  style={{
                                    minHeight: 36,
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: "rgba(87,215,255,0.28)",
                                    backgroundColor: "rgba(87,215,255,0.10)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 12 }}>
                                    Listo
                                  </Text>
                                </Pressable>
                              ) : null}
                            </View>

                            {isAnyMobilePickerActive ? (
                              <View
                                style={{
                                  borderRadius: theme.radius.xl,
                                  borderWidth: 1,
                                  borderColor: "rgba(87,215,255,0.16)",
                                  backgroundColor: "rgba(0,0,0,0.34)",
                                  paddingVertical: 18,
                                  paddingHorizontal: 8,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  shadowColor: "rgba(87,215,255,0.24)",
                                  shadowOpacity: 0.24,
                                  shadowRadius: 20,
                                  shadowOffset: { width: 0, height: 10 },
                                }}
                              >
                                <View
                                  style={{
                                    alignSelf: "stretch",
                                    borderRadius: theme.radius.xl,
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.08)",
                                    backgroundColor: "rgba(11,16,28,0.96)",
                                    paddingVertical: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {mobilePickerMode === "date" ? (
                                    <DateTimePicker
                                      value={new Date(draftEditedCreatedAtISO ?? editingEvent.createdAtISO)}
                                      mode="date"
                                      display={Platform.OS === "ios" ? "spinner" : "default"}
                                      onChange={onNativeDateChange}
                                    />
                                  ) : null}

                                  {mobilePickerMode === "time" ? (
                                    <DateTimePicker
                                      value={new Date(draftEditedCreatedAtISO ?? editingEvent.createdAtISO)}
                                      mode="time"
                                      display={Platform.OS === "ios" ? "spinner" : "default"}
                                      onChange={onNativeTimeChange}
                                    />
                                  ) : null}
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      )}
                    </View>
                  ) : null}

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
                      name={isEditMode ? "history" : "clock-outline"}
                      size={16}
                      color={theme.colors.warn}
                    />
                    <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                      {isEditMode ? "Se guardara con fecha: " : "Se registrara ahora: "}
                      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                        {registrationPreview}
                      </Text>
                    </Text>
                  </View>

                  <View style={{ marginTop: 16 }}>
                    <Button
                      title={isEditMode ? "Guardar cambios" : "Registrar evento"}
                      variant="success"
                      onPress={onSave}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title={isEditMode ? "Cancelar edicion" : "Limpiar seleccion"}
                      variant="ghost"
                      onPress={resetComposer}
                    />
                  </View>
                </View>
              ) : null}
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
              {recentEvents.map((event) => {
                const canManage = canRegister && canMutateTimelineEvent(event);

                return (
                  <TimelinePreviewRow
                    key={event.id}
                    event={event}
                    canManage={canManage}
                    isEditing={editingEventId === event.id}
                    onEdit={() => startEditing(event)}
                    onDelete={() => confirmDeleteEvent(event)}
                  />
                );
              })}
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





