import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextStyle, View, ViewStyle } from "react-native";
import { theme } from "../theme/theme";

type Props = {
  title: string;
  onComplete: () => void;
  holdMs?: number; // default 900
  variant?: "success" | "danger" | "primary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  hint?: string; // ej: "Mantén presionado"
};

export function HoldButton({
  title,
  onComplete,
  holdMs = 900,
  variant = "primary",
  style,
  textStyle,
  disabled,
  hint = "Mantén presionado",
}: Props) {
  const [progress, setProgress] = useState(0); // 0..1
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAt = useRef<number>(0);
  const done = useRef(false);

  const bg =
    variant === "success"
      ? "rgba(34,197,94,0.18)"
      : variant === "danger"
        ? "rgba(239,68,68,0.16)"
        : theme.colors.primary;

  const border =
    variant === "success"
      ? "rgba(34,197,94,0.55)"
      : variant === "danger"
        ? "rgba(239,68,68,0.45)"
        : "rgba(87,215,255,0.55)";

  const fill =
    variant === "success"
      ? "rgba(34,197,94,0.45)"
      : variant === "danger"
        ? "rgba(239,68,68,0.38)"
        : "rgba(0,16,24,0.35)"; // para primary (dark fill)

  const textColor = variant === "primary" ? "#001018" : theme.colors.text;

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    startAt.current = 0;
    done.current = false;
    setProgress(0);
  };

  useEffect(() => () => clear(), []);

  const start = () => {
    if (disabled) return;
    clear();
    startAt.current = Date.now();

    timer.current = setInterval(() => {
      const t = Date.now() - startAt.current;
      const p = Math.min(1, t / holdMs);
      setProgress(p);

      if (p >= 1 && !done.current) {
        done.current = true;
        clear();
        onComplete();
      }
    }, 16);
  };

  const cancel = () => {
    if (disabled) return;
    clear();
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      disabled={disabled}
      style={({ pressed }) => [
        {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: disabled ? theme.colors.line : border,
          backgroundColor: disabled ? "rgba(255,255,255,0.08)" : bg,
          paddingVertical: 14,
          paddingHorizontal: 16,
          overflow: "hidden",
          opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !disabled ? 0.99 : 1 }],
        },
        !disabled ? theme.shadow.card : null,
        style,
      ]}
    >
      {/* Barra de progreso (fill) */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: fill,
        }}
      />

      <Text
        style={[
          {
            color: disabled ? theme.colors.muted : textColor,
            fontSize: 16,
            fontWeight: "900",
            textAlign: "center",
            letterSpacing: 0.3,
          },
          textStyle,
        ]}
      >
        {progress > 0 && progress < 1 ? `${hint}…` : title}
      </Text>
    </Pressable>
  );
}
