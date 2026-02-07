import React from "react";
import { ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function Screen({ children, style }: Props) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
