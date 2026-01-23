import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { usePetsStore } from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

type PetType = "Perro" | "Gato";
type Sex = "Macho" | "Hembra";
type Size = "Pequeño" | "Mediano" | "Grande";
type Social = "Amistoso" | "Selectivo" | "Aislado";

type Pet = {
  id: string;
  type: PetType;
  name: string;
  sex: Sex;
  age: string; // simple por ahora
  size: Size;
  social: Social;
};

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "rgba(87,215,255,0.55)" : theme.colors.line,
        backgroundColor: active
          ? "rgba(87,215,255,0.14)"
          : theme.colors.surface2,
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder }: any) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(167,180,200,0.55)"
        style={{
          backgroundColor: theme.colors.surface2,
          borderWidth: 1,
          borderColor: theme.colors.line,
          borderRadius: theme.radius.lg,
          paddingVertical: 12,
          paddingHorizontal: 14,
          color: theme.colors.text,
          fontWeight: "700",
        }}
      />
    </View>
  );
}

export default function PetsScreen() {
  const pets = usePetsStore((s) => s.pets);
  const addPetToStore = usePetsStore((s) => s.addPet);

  const [type, setType] = useState<PetType>("Perro");
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("Macho");
  const [age, setAge] = useState("1 año");
  const [size, setSize] = useState<Size>("Mediano");
  const [social, setSocial] = useState<Social>("Amistoso");

  const canSave = useMemo(() => name.trim().length >= 2, [name]);

  function addPet() {
    if (!canSave) return;

    addPetToStore({
      type,
      name: name.trim(),
      sex,
      age,
      size,
      social,
    });

    setName("");
  }

  return (
    <Screen>
      <ScrollView>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Mis Peluditos
        </Text>
        <Text
          style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}
        >
          Registra lo esencial. Lo demás lo chismeamos después.
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Nuevo peludito (rapidito)
          </Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Tipo
            </Text>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => setType("Perro")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    type === "Perro"
                      ? "rgba(87,215,255,0.55)"
                      : theme.colors.line,
                  backgroundColor:
                    type === "Perro"
                      ? "rgba(87,215,255,0.14)"
                      : theme.colors.surface2,
                }}
              >
                <MaterialCommunityIcons
                  name="dog"
                  size={22}
                  color={theme.colors.text}
                />
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  Perro
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setType("Gato")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    type === "Gato"
                      ? "rgba(87,215,255,0.55)"
                      : theme.colors.line,
                  backgroundColor:
                    type === "Gato"
                      ? "rgba(87,215,255,0.14)"
                      : theme.colors.surface2,
                }}
              >
                <MaterialCommunityIcons
                  name="cat"
                  size={22}
                  color={theme.colors.text}
                />
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                  Gato
                </Text>
              </Pressable>
            </View>
          </View>

          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Luther, Lyana, Rocky…"
          />

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Sexo
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Macho"
                active={sex === "Macho"}
                onPress={() => setSex("Macho")}
              />
              <Pill
                label="Hembra"
                active={sex === "Hembra"}
                onPress={() => setSex("Hembra")}
              />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Edad (rápido)
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Cachorro"
                active={age === "Cachorro"}
                onPress={() => setAge("Cachorro")}
              />
              <Pill
                label="Adulto"
                active={age === "Adulto"}
                onPress={() => setAge("Adulto")}
              />
              <Pill
                label="Viejito"
                active={age === "Viejito"}
                onPress={() => setAge("Viejito")}
              />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Tamaño
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Pequeño"
                active={size === "Pequeño"}
                onPress={() => setSize("Pequeño")}
              />
              <Pill
                label="Mediano"
                active={size === "Mediano"}
                onPress={() => setSize("Mediano")}
              />
              <Pill
                label="Grande"
                active={size === "Grande"}
                onPress={() => setSize("Grande")}
              />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Sociabilidad (para ubicarlo bien)
            </Text>
            <View style={{ gap: 10 }}>
              <Pill
                label="Amistoso (grupo)"
                active={social === "Amistoso"}
                onPress={() => setSocial("Amistoso")}
              />
              <Pill
                label="Selectivo (supervisión)"
                active={social === "Selectivo"}
                onPress={() => setSocial("Selectivo")}
              />
              <Pill
                label="Aislado (solo)"
                active={social === "Aislado"}
                onPress={() => setSocial("Aislado")}
              />
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Button
              title={canSave ? "Guardar a mi bb 🐾" : "Ponle nombre, ñañit@"}
              onPress={addPet}
            />
          </View>

          <Text
            style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 18 }}
          >
            * Esto nos ayuda a asignar patio, supervisión o zona individual.
          </Text>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Registradas ({pets.length})
          </Text>

          {pets.length === 0 ? (
            <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
              Aún no has agregado peluditos. Cuando agregues uno, podrás
              reservar más rápido.
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {pets.map((p) => (
                <View
                  key={p.id}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.line,
                    backgroundColor: theme.colors.surface2,
                    borderRadius: theme.radius.xl,
                    padding: theme.spacing(2),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 14,
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.line,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={p.type === "Perro" ? "dog" : "cat"}
                        size={20}
                        color={theme.colors.text}
                      />
                    </View>

                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        fontSize: 16,
                      }}
                    >
                      {p.name} • {p.type}
                    </Text>
                  </View>

                  <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                    {p.sex} • {p.age} • {p.size} • {p.social}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
