import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { getPlanById } from "../../src/domain/bookings/plans";
import type {
  NotificationIntent,
  NotificationIntentType,
} from "../../src/domain/notifications";
import { useNotificationsStore } from "../../src/store/notificationsStore";
import { theme } from "../../src/theme/theme";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function formatIntentShortDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-EC", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatIntentFullDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function getNotificationTypeMeta(type: NotificationIntentType) {
  switch (type) {
    case "walk_started":
      return {
        icon: "walk" as IconName,
        label: "Paseo iniciado",
        iconColor: theme.colors.primary,
        chipBorder: "rgba(87,215,255,0.28)",
        chipBackground: "rgba(87,215,255,0.10)",
      };
    case "walk_finished":
      return {
        icon: "flag-checkered" as IconName,
        label: "Paseo finalizado",
        iconColor: theme.colors.good,
        chipBorder: "rgba(61,255,181,0.28)",
        chipBackground: "rgba(61,255,181,0.10)",
      };
    case "photo_available":
      return {
        icon: "image-outline" as IconName,
        label: "Foto disponible",
        iconColor: theme.colors.warn,
        chipBorder: "rgba(255,184,77,0.28)",
        chipBackground: "rgba(255,184,77,0.10)",
      };
  }
}

function getDeliveryMeta(intent: NotificationIntent) {
  if (intent.localDeliveredAtISO) {
    return {
      label: "Entregada",
      icon: "check-decagram" as IconName,
      borderColor: "rgba(61,255,181,0.28)",
      backgroundColor: "rgba(61,255,181,0.10)",
      color: theme.colors.good,
      exactLabel: `Entregada localmente el ${formatIntentFullDateTime(intent.localDeliveredAtISO)}`,
    };
  }

  return {
    label: "Pendiente",
    icon: "clock-outline" as IconName,
    borderColor: "rgba(255,184,77,0.24)",
    backgroundColor: "rgba(255,184,77,0.10)",
    color: theme.colors.warn,
    exactLabel: "Pendiente de entrega local",
  };
}

function DetailRow({
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
      }}
    >
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.muted} />
      <Text style={{ color: theme.colors.muted, fontSize: 12, flex: 1 }}>
        {label}:{" "}
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{value}</Text>
      </Text>
    </View>
  );
}

function SummaryChip({
  label,
  borderColor,
  backgroundColor,
  icon,
  iconColor = theme.colors.text,
}: {
  label: string;
  borderColor: string;
  backgroundColor: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor?: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor,
        backgroundColor,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={14} color={iconColor} /> : null}
      <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "800" }}>
        {label}
      </Text>
    </View>
  );
}

function NotificationCard({ intent }: { intent: NotificationIntent }) {
  const [expanded, setExpanded] = useState(false);
  const typeMeta = getNotificationTypeMeta(intent.type);
  const deliveryMeta = getDeliveryMeta(intent);
  const plan = getPlanById(intent.planId);
  const summary = intent.petName?.trim()
    ? `${intent.petName.trim()} - ${intent.body}`
    : intent.body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? "Ocultar" : "Ver"} detalle de ${intent.title}`}
      accessibilityState={{ expanded }}
      onPress={() => setExpanded((current) => !current)}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: expanded ? typeMeta.chipBorder : "rgba(255,255,255,0.06)",
        backgroundColor: theme.colors.surface2,
        borderRadius: theme.radius.xl,
        padding: theme.spacing(2),
        gap: 12,
        opacity: pressed ? 0.95 : 1,
      })}
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
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: typeMeta.chipBorder,
            }}
          >
            <MaterialCommunityIcons
              name={typeMeta.icon}
              size={20}
              color={typeMeta.iconColor}
            />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: "900",
                lineHeight: 19,
              }}
              numberOfLines={1}
            >
              {intent.title}
            </Text>
            <Text
              style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 17 }}
              numberOfLines={1}
            >
              {summary}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: "700" }}>
            {formatIntentShortDateTime(intent.createdAtISO)}
          </Text>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.muted}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SummaryChip
          label={deliveryMeta.label}
          borderColor={deliveryMeta.borderColor}
          backgroundColor={deliveryMeta.backgroundColor}
          icon={deliveryMeta.icon}
          iconColor={deliveryMeta.color}
        />
        <SummaryChip
          label={intent.planId}
          borderColor="rgba(87,215,255,0.24)"
          backgroundColor="rgba(87,215,255,0.08)"
        />
        <SummaryChip
          label={typeMeta.label}
          borderColor={typeMeta.chipBorder}
          backgroundColor={typeMeta.chipBackground}
        />
      </View>

      {expanded ? (
        <View
          style={{
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.line,
            gap: 10,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
            {intent.body}
          </Text>
          <DetailRow icon="dog-side" label="Mascota" value={intent.petName?.trim() || "-"} />
          <DetailRow icon="cards-outline" label="Plan" value={plan.name} />
          <DetailRow icon="identifier" label="Plan ID" value={intent.planId} />
          <DetailRow
            icon="calendar-clock"
            label="Fecha completa"
            value={formatIntentFullDateTime(intent.createdAtISO)}
          />
          <DetailRow
            icon="check-circle-outline"
            label="Estado exacto"
            value={deliveryMeta.exactLabel}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const intents = useNotificationsStore((state) => state.intents);

  const notifications = useMemo(() => {
    return [...intents].sort((a, b) => {
      const byDate = b.createdAtISO.localeCompare(a.createdAtISO);
      if (byDate !== 0) {
        return byDate;
      }

      return b.id.localeCompare(a.id);
    });
  }, [intents]);

  const deliveredCount = notifications.filter((intent) => intent.localDeliveredAtISO).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing(2),
          paddingBottom: theme.spacing(4),
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
          Inbox
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}>
          Timeline local de intents y entregas de notificaciones. Solo lectura por ahora.
        </Text>

        <Card style={{ marginTop: theme.spacing(3), backgroundColor: theme.colors.surface2 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>
                Actividad ({notifications.length})
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4, fontSize: 13 }}>
                Nuevas primero, sin filtros ni acciones.
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(61,255,181,0.24)",
                backgroundColor: "rgba(61,255,181,0.10)",
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "900" }}>
                {deliveredCount}/{notifications.length} entregadas
              </Text>
            </View>
          </View>
        </Card>

        {notifications.length === 0 ? (
          <Card style={{ marginTop: theme.spacing(2), backgroundColor: theme.colors.surface2 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>
              Aun no hay actividad
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 20 }}>
              Cuando se generen intents locales de notificacion, apareceran aqui en orden
              descendente.
            </Text>
          </Card>
        ) : (
          <View style={{ marginTop: theme.spacing(2), gap: 12 }}>
            {notifications.map((intent) => (
              <NotificationCard key={intent.id} intent={intent} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
