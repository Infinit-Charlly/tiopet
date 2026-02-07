import { Text, View } from "react-native";
import { theme } from "../src/theme/theme";
import { Screen } from "../src/ui/Screen";

export default function ModalScreen() {
  return (
    <Screen>
      <View style={{ padding: theme.spacing(2) }}>
        <Text
          style={{ color: theme.colors.text, fontWeight: "900", fontSize: 20 }}
        >
          Modal (placeholder)
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
          Este modal venía del template. Lo dejamos simple para que no rompa
          nada.
        </Text>
      </View>
    </Screen>
  );
}
