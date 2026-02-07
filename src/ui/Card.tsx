import React from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../theme/theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.line,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing(2),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
