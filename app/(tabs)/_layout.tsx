import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useBookingsStore } from "../../src/store/bookingsStore";
import { usePetsStore } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";

export default function RootLayout() {
  const hydrateBookings = useBookingsStore((s) => s.hydrate);
  const hydratePets = usePetsStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateBookings();
    void hydratePets();
  }, [hydrateBookings, hydratePets]);

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
      {/* Tabs visibles */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Reservas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pets"
        options={{
          title: "Peluditos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "Más",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Rutas dentro de (tabs) PERO OCULTAS del tab bar */}
      <Tabs.Screen
        name="shop"
        options={{
          href: null, // 👈 esto lo saca del tab bar
        }}
      />

      <Tabs.Screen
        name="transport"
        options={{
          href: null, // 👈 esto lo saca del tab bar
        }}
      />
    </Tabs>
  );
}
