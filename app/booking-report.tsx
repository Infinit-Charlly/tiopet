import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { useBookingsStore } from "../src/store/bookingsStore";
import { usePetsStore } from "../src/store/petsStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { DailyCareReportView } from "../src/ui/DailyCareReportView";
import { Screen } from "../src/ui/Screen";

export default function BookingReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";
  const requestedDayKey = typeof params.dayKey === "string" ? params.dayKey : undefined;
  const bookings = useBookingsStore((state) => state.bookings);
  const pets = usePetsStore((state) => state.pets);

  const booking = useMemo(
    () => bookings.find((item) => item.id === bookingId),
    [bookings, bookingId],
  );
  const pet = useMemo(() => {
    if (!booking) {
      return undefined;
    }

    if (booking.petId) {
      return pets.find((item) => item.id === booking.petId);
    }

    return pets.find((item) => item.name === booking.petName);
  }, [booking, pets]);

  if (!booking) {
    return (
      <Screen>
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
            Reporte diario
          </Text>
          <Card>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              Reserva no encontrada
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
              No pudimos cargar este reporte. Vuelve al historial y abre el reporte desde la
              tarjeta de la reserva.
            </Text>
          </Card>
          <Button
            title="Volver al historial"
            onPress={() => router.replace("/(tabs)/history")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <DailyCareReportView
      booking={booking}
      pet={pet}
      requestedDayKey={requestedDayKey}
      onBack={() => router.back()}
    />
  );
}
