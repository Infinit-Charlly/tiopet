import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    View,
} from "react-native";
import { theme } from "../theme/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animIn = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          speed: 18,
          bounciness: 7,
          useNativeDriver: true,
        }),
      ]),
    [opacity, translateY],
  );

  const animOut = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 40,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
    [opacity, translateY],
  );

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(40);
      animIn.start();
    } else {
      opacity.setValue(0);
      translateY.setValue(40);
    }
  }, [visible, animIn, opacity, translateY]);

  const close = () => {
    animOut.start(({ finished }) => {
      if (finished) onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={close} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View
            style={{
              transform: [{ translateY }],
              padding: theme.spacing(2),
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.xl,
                padding: theme.spacing(2),
                ...theme.shadow.card,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  alignSelf: "center",
                  width: 54,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.20)",
                  marginBottom: 12,
                }}
              />

              {children}
            </View>

            <View style={{ height: 10 }} />
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
