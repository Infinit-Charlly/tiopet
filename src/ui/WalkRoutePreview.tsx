import { useMemo } from "react";
import { Text, View } from "react-native";

import type { WalkRoutePoint } from "../domain/bookings";
import { theme } from "../theme/theme";

const CARD_WIDTH = 168;
const PREVIEW_WIDTH = 148;
const PREVIEW_HEIGHT = 84;
const PREVIEW_PADDING = 12;
const MAX_RENDER_POINTS = 28;
const ROUTE_LINE_THICKNESS = 3;

type NormalizedPoint = {
  x: number;
  y: number;
};

function sampleRoutePoints(routePoints: WalkRoutePoint[]) {
  if (routePoints.length <= MAX_RENDER_POINTS) {
    return routePoints;
  }

  return Array.from({ length: MAX_RENDER_POINTS }, (_, index) => {
    const ratio = index / (MAX_RENDER_POINTS - 1);
    const pointIndex = Math.round(ratio * (routePoints.length - 1));
    return routePoints[pointIndex]!;
  });
}

function normalizeRoutePoints(routePoints: WalkRoutePoint[]) {
  const sampledPoints = sampleRoutePoints(routePoints);
  const latitudes = sampledPoints.map((point) => point.latitude);
  const longitudes = sampledPoints.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = maxLatitude - minLatitude;
  const longitudeSpan = maxLongitude - minLongitude;
  const innerWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2;
  const innerHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2;
  const scaleX = longitudeSpan > 0 ? innerWidth / longitudeSpan : 0;
  const scaleY = latitudeSpan > 0 ? innerHeight / latitudeSpan : 0;
  const scale =
    longitudeSpan > 0 && latitudeSpan > 0
      ? Math.min(scaleX, scaleY)
      : longitudeSpan > 0
        ? scaleX
        : latitudeSpan > 0
          ? scaleY
          : 0;
  const contentWidth = longitudeSpan * scale;
  const contentHeight = latitudeSpan * scale;
  const offsetX = PREVIEW_PADDING + (innerWidth - contentWidth) / 2;
  const offsetY = PREVIEW_PADDING + (innerHeight - contentHeight) / 2;

  return sampledPoints.map((point) => ({
    x:
      longitudeSpan > 0
        ? offsetX + (point.longitude - minLongitude) * scale
        : PREVIEW_WIDTH / 2,
    y:
      latitudeSpan > 0
        ? offsetY + (maxLatitude - point.latitude) * scale
        : PREVIEW_HEIGHT / 2,
  }));
}

function RouteMarker({
  point,
  color,
  size,
}: {
  point: NormalizedPoint;
  color: string;
  size: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: point.x - size / 2,
        top: point.y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 2,
        borderColor: theme.colors.bg,
      }}
    />
  );
}

function MarkerLegend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: "800" }}>
        {label}
      </Text>
    </View>
  );
}

export function WalkRoutePreview({
  routePoints,
  label = "Ruta local",
}: {
  routePoints?: WalkRoutePoint[];
  label?: string;
}) {
  const normalizedPoints = useMemo(
    () => (routePoints && routePoints.length > 0 ? normalizeRoutePoints(routePoints) : []),
    [routePoints],
  );

  if (!routePoints || routePoints.length === 0 || normalizedPoints.length === 0) {
    return null;
  }

  const startPoint = normalizedPoints[0]!;
  const endPoint = normalizedPoints[normalizedPoints.length - 1]!;

  return (
    <View
      style={{
        marginTop: 10,
        width: CARD_WIDTH,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(87,215,255,0.16)",
        backgroundColor: "rgba(10,18,32,0.92)",
        padding: 10,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 92,
          height: 92,
          borderRadius: 46,
          right: -18,
          top: -24,
          backgroundColor: "rgba(87,215,255,0.08)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 82,
          height: 82,
          borderRadius: 41,
          left: -24,
          bottom: -30,
          backgroundColor: "rgba(255,184,77,0.07)",
        }}
      />

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
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: "800" }}>
          {routePoints.length} pts
        </Text>
      </View>

      <View
        style={{
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.025)",
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: PREVIEW_PADDING,
            right: PREVIEW_PADDING,
            top: PREVIEW_HEIGHT / 2,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: PREVIEW_PADDING,
            bottom: PREVIEW_PADDING,
            left: PREVIEW_WIDTH / 2,
            width: 1,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />

        {normalizedPoints.slice(1).map((point, index) => {
          const previousPoint = normalizedPoints[index]!;
          const deltaX = point.x - previousPoint.x;
          const deltaY = point.y - previousPoint.y;
          const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const lineAngle = Math.atan2(deltaY, deltaX);

          if (lineLength < 1) {
            return null;
          }

          return (
            <View key={`route-segment-${index}`}>
              <View
                style={{
                  position: "absolute",
                  left: (previousPoint.x + point.x) / 2 - lineLength / 2,
                  top: (previousPoint.y + point.y) / 2 - 3,
                  width: lineLength,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: "rgba(87,215,255,0.18)",
                  transform: [{ rotateZ: `${lineAngle}rad` }],
                }}
              />
              <View
                style={{
                  position: "absolute",
                  left: (previousPoint.x + point.x) / 2 - lineLength / 2,
                  top: (previousPoint.y + point.y) / 2 - ROUTE_LINE_THICKNESS / 2,
                  width: lineLength,
                  height: ROUTE_LINE_THICKNESS,
                  borderRadius: 999,
                  backgroundColor: "rgba(87,215,255,0.92)",
                  transform: [{ rotateZ: `${lineAngle}rad` }],
                }}
              />
            </View>
          );
        })}

        <RouteMarker point={startPoint} color={theme.colors.primary} size={12} />
        <RouteMarker point={endPoint} color={theme.colors.warn} size={9} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <MarkerLegend color={theme.colors.primary} label="Inicio" />
        <MarkerLegend color={theme.colors.warn} label="Fin" />
      </View>
    </View>
  );
}
