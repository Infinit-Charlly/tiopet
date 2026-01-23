import React from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={[{ flex: 1, padding: theme.spacing(2) }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
