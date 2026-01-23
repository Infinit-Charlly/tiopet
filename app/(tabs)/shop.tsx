import React from "react";
import { ScrollView, Text, View } from "react-native";
import { theme } from "../../src/theme/theme";
import { Screen } from "../../src/ui/Screen";

export default function ShopScreen() {
  return (
    <Screen>
        <ScrollView>
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.spacing(2) }}>
      <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900" }}>
        Tienda
      </Text>
      <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
        Tienda.
      </Text>
    </View>
    </ScrollView>
    </Screen>
  );
}
