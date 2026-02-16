import { Pressable, Text, TextStyle, ViewStyle } from "react-native";
import { theme } from "../theme/theme";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost"
  | "outline";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
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
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const isOutline = variant === "outline";

  const bg =
    isGhost || isOutline
      ? "transparent"
      : isPrimary
        ? theme.colors.primary
        : variant === "success"
          ? "rgba(34,197,94,0.22)"
          : variant === "danger"
            ? "rgba(239,68,68,0.16)"
            : theme.colors.surface2;

  const borderColor =
    variant === "success"
      ? "rgba(34,197,94,0.55)"
      : variant === "danger"
        ? "rgba(239,68,68,0.45)"
        : theme.colors.line;

  const color = disabled
    ? theme.colors.muted
    : isPrimary
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
          borderColor: disabled ? theme.colors.line : borderColor,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
        },
        // sombra solo para botones con “cuerpo”
        !disabled && !isGhost && !isOutline ? theme.shadow.card : null,
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
