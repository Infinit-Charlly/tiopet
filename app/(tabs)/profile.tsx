import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useBookingsStore } from "../../src/store/bookingsStore";
import { usePetsStore } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.line,
        backgroundColor: theme.colors.surface2,
        padding: theme.spacing(2),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.line,
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
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
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={theme.colors.muted}
        />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const bookingsCount = useBookingsStore((s) => s.bookings.length);
  const petsCount = usePetsStore((s) => s.pets.length);

  const clearBookings = useBookingsStore((s) => s.clearAll);
  const clearPets = usePetsStore((s) => s.clearAll);

  return (
    <Screen>
      <ScrollView>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Cuenta
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Tu espacio: datos, accesos y configuración ⚙️
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            Accesos rápidos
          </Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <MenuRow
              icon="receipt-text"
              title="Mis reservas"
              subtitle={`${bookingsCount} en total`}
              onPress={() => router.push("/(tabs)/history")}
            />

            <MenuRow
              icon="paw"
              title="Mis peluditos"
              subtitle={`${petsCount} registrados`}
              onPress={() => router.push("/(tabs)/pets")}
            />

            <MenuRow
              icon="map-marker"
              title="Direcciones"
              subtitle="Próximamente (para transporte pro)"
              onPress={() => {}}
            />

            <MenuRow
              icon="shield-account"
              title="Iniciar sesión"
              subtitle="Próximamente (Apple / Google / WhatsApp)"
              onPress={() => {}}
            />
          </View>
        </Card>

        {__DEV__ && (
          <Card style={{ marginTop: theme.spacing(2) }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              DEV
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              Reseteo de datos locales (solo desarrollo).
            </Text>

            <View style={{ marginTop: 12 }}>
              <Button
                title="Reset datos (DEV)"
                variant="danger"
                onPress={async () => {
                  await clearBookings();
                  await clearPets();
                }}
              />
            </View>
          </Card>
        )}

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
