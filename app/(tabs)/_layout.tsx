import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { theme } from "../../src/theme/theme";

export default function TabLayout() {
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
        name="transport"
        options={{
          title: "Transporte",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Tienda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size ?? 24} color={color} />
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
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
