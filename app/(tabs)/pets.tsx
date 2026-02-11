import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Pet,
  PetType,
  Sex,
  Size,
  Social,
  usePetsStore,
} from "../../src/store/petsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

type Accent = {
  border: string;
  bg: string;
  text: string;
};

const dogAccent: Accent = {
  border: "rgba(87,215,255,0.55)",
  bg: "rgba(87,215,255,0.14)",
  text: theme.colors.text,
};

const catAccent: Accent = {
  border: "rgba(255,105,180,0.55)", // rosado elegante
  bg: "rgba(255,105,180,0.14)",
  text: theme.colors.text,
};

function accentByType(type: PetType): Accent {
  return type === "Gato" ? catAccent : dogAccent;
}

function Pill({
  label,
  active,
  onPress,
  accent,
  fullWidth,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent: Accent;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: fullWidth ? "100%" : undefined,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? accent.border : theme.colors.line,
        backgroundColor: active ? accent.bg : theme.colors.surface2,
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
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
  const removePet = usePetsStore((s) => s.removePet);
  const updatePet = usePetsStore((s) => s.updatePet);

  // Form state
  const [type, setType] = useState<PetType>("Perro");
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("Macho");
  const [age, setAge] = useState<string>("Cachorro");
  const [size, setSize] = useState<Size>("Mediano");
  const [social, setSocial] = useState<Social>("Amistoso");

  // Edit modal
  const [editing, setEditing] = useState<Pet | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<PetType>("Perro");
  const [editSex, setEditSex] = useState<Sex>("Macho");
  const [editAge, setEditAge] = useState<string>("Cachorro");
  const [editSize, setEditSize] = useState<Size>("Mediano");
  const [editSocial, setEditSocial] = useState<Social>("Amistoso");

  const canSave = useMemo(() => name.trim().length >= 2, [name]);
  const accent = accentByType(type);

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

  function askDelete(p: Pet) {
    Alert.alert(
      "Eliminar peludito",
      `¿Seguro que deseas eliminar a "${p.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: () => removePet(p.id),
        },
      ],
    );
  }

  function openEdit(p: Pet) {
    setEditing(p);
    setEditName(p.name);
    setEditType(p.type);
    setEditSex(p.sex);
    setEditAge(p.age);
    setEditSize(p.size);
    setEditSocial(p.social);
  }

  function closeEdit() {
    setEditing(null);
  }

  const canEditSave = useMemo(() => editName.trim().length >= 2, [editName]);
  const editAccent = accentByType(editType);

  function saveEdit() {
    if (!editing) return;
    if (!canEditSave) return;

    updatePet(editing.id, {
      name: editName.trim(),
      type: editType,
      sex: editSex,
      age: editAge,
      size: editSize,
      social: editSocial,
    });

    closeEdit();
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

        {/* Crear */}
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

          {/* Tipo */}
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
                    type === "Perro" ? dogAccent.border : theme.colors.line,
                  backgroundColor:
                    type === "Perro" ? dogAccent.bg : theme.colors.surface2,
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
                    type === "Gato" ? catAccent.border : theme.colors.line,
                  backgroundColor:
                    type === "Gato" ? catAccent.bg : theme.colors.surface2,
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
            placeholder="Ej: Luther, Lyanna, Rocky…"
          />

          {/* Sexo */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Sexo
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Macho"
                active={sex === "Macho"}
                onPress={() => setSex("Macho")}
                accent={accent}
              />
              <Pill
                label="Hembra"
                active={sex === "Hembra"}
                onPress={() => setSex("Hembra")}
                accent={accent}
              />
            </View>
          </View>

          {/* Edad */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Edad (rápido)
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Cachorro"
                active={age === "Cachorro"}
                onPress={() => setAge("Cachorro")}
                accent={accent}
              />
              <Pill
                label="Adulto"
                active={age === "Adulto"}
                onPress={() => setAge("Adulto")}
                accent={accent}
              />
              <Pill
                label="Viejito"
                active={age === "Viejito"}
                onPress={() => setAge("Viejito")}
                accent={accent}
              />
            </View>
          </View>

          {/* Tamaño */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Tamaño
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pill
                label="Pequeño"
                active={size === "Pequeño"}
                onPress={() => setSize("Pequeño")}
                accent={accent}
              />
              <Pill
                label="Mediano"
                active={size === "Mediano"}
                onPress={() => setSize("Mediano")}
                accent={accent}
              />
              <Pill
                label="Grande"
                active={size === "Grande"}
                onPress={() => setSize("Grande")}
                accent={accent}
              />
            </View>
          </View>

          {/* Social */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              Sociabilidad (para ubicarlo bien)
            </Text>
            <View style={{ gap: 10 }}>
              <Pill
                label="Amistoso (grupo)"
                active={social === "Amistoso"}
                onPress={() => setSocial("Amistoso")}
                accent={accent}
                fullWidth
              />
              <Pill
                label="Selectivo (supervisión)"
                active={social === "Selectivo"}
                onPress={() => setSocial("Selectivo")}
                accent={accent}
                fullWidth
              />
              <Pill
                label="Aislado (solo)"
                active={social === "Aislado"}
                onPress={() => setSocial("Aislado")}
                accent={accent}
                fullWidth
              />
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Button
              title={canSave ? "Guardar a mi bb 🐾" : "Ponle nombre, ñañit@"}
              onPress={addPet}
              disabled={!canSave}
              variant="primary"
            />
          </View>

          <Text
            style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 18 }}
          >
            * Esto nos ayuda a asignar patio, supervisión o zona individual.
          </Text>
        </Card>

        {/* Lista */}
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
              {pets.map((p) => {
                const rowAccent = accentByType(p.type);
                return (
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
                          borderColor: rowAccent.border,
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

                    <View
                      style={{ marginTop: 12, flexDirection: "row", gap: 10 }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Editar"
                          onPress={() => openEdit(p)}
                          variant="success"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Eliminar"
                          onPress={() => askDelete(p)}
                          variant="danger"
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <View style={{ height: 22 }} />

        {/* Modal Edit */}
        <Modal
          visible={Boolean(editing)}
          animationType="slide"
          transparent
          onRequestClose={closeEdit}
        >
          <Pressable
            onPress={closeEdit}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              justifyContent: "flex-end",
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderWidth: 1,
                borderColor: theme.colors.line,
                padding: theme.spacing(2),
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  width: 54,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  marginBottom: 12,
                }}
              />

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 18,
                  fontWeight: "900",
                }}
              >
                Editar peludito ✨
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                Ajusta todo sin dramas. Guardas y queda fino.
              </Text>

              <Field
                label="Nombre"
                value={editName}
                onChangeText={setEditName}
              />

              {/* Tipo */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  Tipo
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                >
                  <Pressable
                    onPress={() => setEditType("Perro")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        editType === "Perro"
                          ? dogAccent.border
                          : theme.colors.line,
                      backgroundColor:
                        editType === "Perro"
                          ? dogAccent.bg
                          : theme.colors.surface2,
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Perro
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setEditType("Gato")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        editType === "Gato"
                          ? catAccent.border
                          : theme.colors.line,
                      backgroundColor:
                        editType === "Gato"
                          ? catAccent.bg
                          : theme.colors.surface2,
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Gato
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Sexo */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  Sexo
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                >
                  <Pill
                    label="Macho"
                    active={editSex === "Macho"}
                    onPress={() => setEditSex("Macho")}
                    accent={editAccent}
                  />
                  <Pill
                    label="Hembra"
                    active={editSex === "Hembra"}
                    onPress={() => setEditSex("Hembra")}
                    accent={editAccent}
                  />
                </View>
              </View>

              {/* Edad */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  Edad
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                >
                  <Pill
                    label="Cachorro"
                    active={editAge === "Cachorro"}
                    onPress={() => setEditAge("Cachorro")}
                    accent={editAccent}
                  />
                  <Pill
                    label="Adulto"
                    active={editAge === "Adulto"}
                    onPress={() => setEditAge("Adulto")}
                    accent={editAccent}
                  />
                  <Pill
                    label="Viejito"
                    active={editAge === "Viejito"}
                    onPress={() => setEditAge("Viejito")}
                    accent={editAccent}
                  />
                </View>
              </View>

              {/* Tamaño */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  Tamaño
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                >
                  <Pill
                    label="Pequeño"
                    active={editSize === "Pequeño"}
                    onPress={() => setEditSize("Pequeño")}
                    accent={editAccent}
                  />
                  <Pill
                    label="Mediano"
                    active={editSize === "Mediano"}
                    onPress={() => setEditSize("Mediano")}
                    accent={editAccent}
                  />
                  <Pill
                    label="Grande"
                    active={editSize === "Grande"}
                    onPress={() => setEditSize("Grande")}
                    accent={editAccent}
                  />
                </View>
              </View>

              {/* Social */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
                  Sociabilidad
                </Text>
                <View style={{ gap: 10 }}>
                  <Pill
                    label="Amistoso (grupo)"
                    active={editSocial === "Amistoso"}
                    onPress={() => setEditSocial("Amistoso")}
                    accent={editAccent}
                    fullWidth
                  />
                  <Pill
                    label="Selectivo (supervisión)"
                    active={editSocial === "Selectivo"}
                    onPress={() => setEditSocial("Selectivo")}
                    accent={editAccent}
                    fullWidth
                  />
                  <Pill
                    label="Aislado (solo)"
                    active={editSocial === "Aislado"}
                    onPress={() => setEditSocial("Aislado")}
                    accent={editAccent}
                    fullWidth
                  />
                </View>
              </View>

              <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancelar"
                    onPress={closeEdit}
                    variant="secondary"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Guardar"
                    onPress={saveEdit}
                    variant="success"
                    disabled={!canEditSave}
                  />
                </View>
              </View>

              {/* iOS safe-ish bottom space */}
              <View style={{ height: Platform.OS === "ios" ? 10 : 4 }} />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </Screen>
  );
}
