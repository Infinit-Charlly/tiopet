import React from "react";
import { Pressable, Text, TextStyle, ViewStyle } from "react-native";
import { theme } from "../theme/theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled,
}: Props) {
  const bg =
    variant === "primary" ? theme.colors.primary : theme.colors.surface2;
  const color = disabled
    ? theme.colors.muted
    : variant === "primary"
      ? "#001018"
      : theme.colors.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? "rgba(255,255,255,0.08)" : bg,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.line,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
        },
        !disabled ? theme.shadow.card : null,
        style,
      ]}
    >
      <Text
        style={[
          {
            color,
            fontSize: 16,
            fontWeight: "800",
            textAlign: "center",
            letterSpacing: 0.3,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
