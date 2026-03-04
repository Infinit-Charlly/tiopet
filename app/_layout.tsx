import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/store/authStore";
import { theme } from "../src/theme/theme";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    const inLogin = segments[0] === "login"; // app/login.tsx
    if (!user && !inLogin) router.replace("/login");
    if (user && inLogin) router.replace("/(tabs)");
  }, [hydrated, user, segments, router]);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}
