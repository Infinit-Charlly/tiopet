import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useGoogleAuth } from "../src/auth/google";
import { useAuthStore } from "../src/store/authStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { Screen } from "../src/ui/Screen";

export default function LoginScreen() {
  const router = useRouter();
  const signInAnon = useAuthStore((s) => s.signInAnon);
  const loading = useAuthStore((s) => s.loading);
  const { request, signInWithGoogle } = useGoogleAuth();

  return (
    <Screen>
      <View style={{ gap: 14 }}>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Iniciar sesión
        </Text>
        <Text style={{ color: theme.colors.muted }}>
          Hoy abrimos la puerta. Mañana le ponemos Apple/Google como armadura
          legendaria.
        </Text>

        <Card style={{ marginTop: theme.spacing(2), gap: 10 }}>
          <Button
            title={loading ? "Entrando..." : "Entrar (modo demo / anónimo)"}
            variant="primary"
            onPress={async () => {
              await signInAnon();
              router.replace("/(tabs)");
            }}
            disabled={loading}
          />
          <Button
            title="Entrar con Google"
            disabled={!request}
            onPress={async () => {
              try {
                await signInWithGoogle();
              } catch (e) {
                console.log(e);
                alert(
                  "No se pudo iniciar sesión con Google. Revisa la consola.",
                );
              }
            }}
          />

          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
            Esto es temporal para avanzar. Luego conectamos Apple / Google de
            forma correcta.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
