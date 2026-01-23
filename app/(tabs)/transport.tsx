import React from "react";
import { ScrollView, Text, View } from "react-native";
import { theme } from "../../src/theme/theme";
import { Screen } from "../../src/ui/Screen";

export default function TransportScreen() {
  return (
    <Screen>
        <ScrollView>
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(2) }}>
      <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900" }}>
        Transporte
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
        Transporte.
      </Text>
    </View>
    </ScrollView>
    </Screen>
  );
}
