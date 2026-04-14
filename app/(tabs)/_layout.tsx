import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useBookingsStore } from "../../src/store/bookingsStore";
import { useNotificationsStore } from "../../src/store/notificationsStore";
import { usePetsStore } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";

export default function RootLayout() {
  const hydrateBookings = useBookingsStore((s) => s.hydrate);
  const hydrateNotifications = useNotificationsStore((s) => s.hydrate);
  const hydratePets = usePetsStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateBookings();
    void hydrateNotifications();
    void hydratePets();
  }, [hydrateBookings, hydrateNotifications, hydratePets]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.line,
          height: 64,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      {/* Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Wizard: Nueva reserva */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Reservar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Peluditos */}
      <Tabs.Screen
        name="pets"
        options={{
          title: "Peluditos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Historial: Mis reservas */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Cuenta */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Ocultas */}
      <Tabs.Screen
        name="more"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="transport"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
