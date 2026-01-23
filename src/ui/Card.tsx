import React from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.line,
          padding: theme.spacing(2),
        },
        theme.shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}
