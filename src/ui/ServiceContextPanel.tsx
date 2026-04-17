import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { getActiveBookingAddons } from "../domain/bookings";
import { getTransportLabel } from "../domain/bookings/labels";
import type { Booking } from "../store/bookingsStore";
import type { Pet } from "../store/petsStore";
import { theme } from "../theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type ReportServiceContextEntry = {
  icon: IconName;
  label: string;
  value: string;
};

function truncateText(value: string, maxLength = 96) {
  const trimmed = value.trim().replace(/\s+/g, " ");

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function buildAddonsSummary(booking: Booking, maxLength = 120) {
  return truncateText(
    getActiveBookingAddons(booking.addons)
      .map((addon) => addon.label)
      .join(" · "),
    maxLength,
  );
}

function hasPickup(transportType: Booking["transportType"]) {
  return transportType === "pickup" || transportType === "both";
}

function hasDropoff(transportType: Booking["transportType"]) {
  return transportType === "dropoff" || transportType === "both";
}

function buildTransportSummary(booking: Booking, maxLength = 140) {
  const parts = [getTransportLabel(true, booking.transportType)];

  if (hasPickup(booking.transportType) && booking.pickupAddress) {
    parts.push(`Recogida: ${booking.pickupAddress}`);
  }

  if (hasDropoff(booking.transportType) && booking.dropoffAddress) {
    parts.push(`Entrega: ${booking.dropoffAddress}`);
  }

  if (booking.transportNotes) {
    parts.push(booking.transportNotes);
  }

  return truncateText(parts.join(" | "), maxLength);
}

function buildCcpSummary(booking: Booking, maxLength = 120) {
  return truncateText([booking.ccpName, booking.ccpAddress].filter(Boolean).join(" | "), maxLength);
}

export function getReportServiceContextEntries(booking: Booking): ReportServiceContextEntry[] {
  const activeAddons = getActiveBookingAddons(booking.addons);
  const hasTransport = booking.transportNeeded && booking.transportType !== "none";
  const hasCcp = Boolean(booking.ccpName || booking.ccpAddress);

  return [
    hasTransport
      ? {
          icon: "car-outline",
          label: "Transporte",
          value: buildTransportSummary(booking),
        }
      : null,
    activeAddons.length > 0
      ? {
          icon: "star-four-points-outline",
          label: "Servicios adicionales",
          value: buildAddonsSummary(booking),
        }
      : null,
    hasCcp
      ? {
          icon: "shield-check-outline",
          label: "CCP",
          value: buildCcpSummary(booking),
        }
      : null,
  ].filter(Boolean) as ReportServiceContextEntry[];
}

export function hasReportServiceContext(booking: Booking, _pet?: Pet) {
  return getReportServiceContextEntries(booking).length > 0;
}

function DetailPill({
  icon,
  label,
}: {
  icon: IconName;
  label: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.04)",
      }}
    >
      <MaterialCommunityIcons name={icon} size={15} color={theme.colors.warn} />
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(87,215,255,0.10)",
          borderWidth: 1,
          borderColor: "rgba(87,215,255,0.18)",
          marginTop: 1,
        }}
      >
        <MaterialCommunityIcons name={icon} size={14} color={theme.colors.warn} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
        <Text style={{ color: theme.colors.text, lineHeight: 19 }}>{value}</Text>
      </View>
    </View>
  );
}

export function HistoryServiceContext({ booking }: { booking: Booking }) {
  const activeAddons = getActiveBookingAddons(booking.addons);
  const hasTransport = booking.transportNeeded && booking.transportType !== "none";
  const hasCcp = Boolean(booking.ccpName || booking.ccpAddress);
  const hasContext = hasTransport || activeAddons.length > 0 || hasCcp;

  if (!hasContext) {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 12,
        padding: theme.spacing(1.5),
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(87,215,255,0.16)",
        backgroundColor: "rgba(255,255,255,0.03)",
        gap: 12,
      }}
    >
      <View style={{ gap: 5 }}>
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "900" }}>
          Contexto del servicio
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
          Detalles de reserva visibles sin mezclar el timeline operativo.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {hasTransport ? (
          <DetailPill
            icon="car-outline"
            label={getTransportLabel(true, booking.transportType)}
          />
        ) : null}
        {activeAddons.length > 0 ? (
          <DetailPill
            icon="star-four-points-outline"
            label={`${activeAddons.length} extra${activeAddons.length === 1 ? "" : "s"}`}
          />
        ) : null}
        {hasCcp ? <DetailPill icon="shield-check-outline" label="CCP registrado" /> : null}
      </View>

      <View style={{ gap: 10 }}>
        {hasTransport ? (
          <DetailRow
            icon="car"
            label="Transporte"
            value={getTransportLabel(true, booking.transportType)}
          />
        ) : null}
        {hasTransport && hasPickup(booking.transportType) && booking.pickupAddress ? (
          <DetailRow
            icon="map-marker-outline"
            label="Recogida"
            value={truncateText(booking.pickupAddress, 100)}
          />
        ) : null}
        {hasTransport && hasDropoff(booking.transportType) && booking.dropoffAddress ? (
          <DetailRow
            icon="map-marker-outline"
            label="Entrega"
            value={truncateText(booking.dropoffAddress, 100)}
          />
        ) : null}
        {hasTransport && booking.transportNotes ? (
          <DetailRow
            icon="clipboard-text-outline"
            label="Indicaciones"
            value={truncateText(booking.transportNotes, 100)}
          />
        ) : null}
        {activeAddons.length > 0 ? (
          <DetailRow
            icon="star-four-points"
            label="Servicios adicionales"
            value={buildAddonsSummary(booking, 100)}
          />
        ) : null}
        {hasCcp ? (
          <DetailRow
            icon="shield-check"
            label="CCP"
            value={truncateText(
              [booking.ccpName, booking.ccpAddress].filter(Boolean).join(" - "),
              100,
            )}
          />
        ) : null}
      </View>
    </View>
  );
}

export function ReportServiceContext({
  booking,
}: {
  booking: Booking;
  pet?: Pet;
}) {
  const entries = getReportServiceContextEntries(booking);

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
          Contexto del servicio
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {entries.map((entry) => (
          <View
            key={entry.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 12,
              paddingVertical: 11,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(87,215,255,0.10)",
                borderWidth: 1,
                borderColor: "rgba(87,215,255,0.18)",
              }}
            >
              <MaterialCommunityIcons name={entry.icon} size={15} color={theme.colors.warn} />
            </View>

            <Text
              numberOfLines={2}
              style={{ color: theme.colors.text, flex: 1, lineHeight: 19 }}
            >
              <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>{entry.label}: </Text>
              {entry.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
