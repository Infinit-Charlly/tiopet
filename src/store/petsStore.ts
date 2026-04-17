import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type PetType = "Perro" | "Gato";
export type Sex = "Macho" | "Hembra";
export type Size = "Peque\u00f1o" | "Mediano" | "Grande";
export type Social = "Amistoso" | "Selectivo" | "Aislado";

export type Pet = {
  id: string;
  type: PetType;
  name: string;
  sex: Sex;
  age: string;
  size: Size;
  social: Social;
  photoUri?: string;
  notes?: string;
  temperament?: string;
  specialCare?: string;
};

type State = {
  pets: Pet[];
  hydrated: boolean;

  addPet: (pet: Omit<Pet, "id">) => void;
  removePet: (id: string) => void;
  updatePet: (id: string, patch: Partial<Omit<Pet, "id">>) => void;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_pets_v1";

function newId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `p_${t}_${r}`;
}

function fixDuplicateIds(list: Pet[]) {
  const seen = new Set<string>();
  let changed = false;

  const fixed = list.map((p) => {
    if (!p.id || seen.has(p.id)) {
      changed = true;
      const id = newId();
      seen.add(id);
      return { ...p, id };
    }

    seen.add(p.id);
    return p;
  });

  return { fixed, changed };
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeHydratedPet(raw: Partial<Pet> & Record<string, unknown>): Pet {
  return {
    id: typeof raw.id === "string" && raw.id.length > 0 ? raw.id : newId(),
    type: raw.type === "Gato" ? "Gato" : "Perro",
    name:
      typeof raw.name === "string" && raw.name.length > 0
        ? raw.name
        : "Peludito",
    sex: raw.sex === "Hembra" ? "Hembra" : "Macho",
    age:
      typeof raw.age === "string" && raw.age.length > 0
        ? raw.age
        : "Cachorro",
    size:
      raw.size === "Peque\u00f1o" || raw.size === "Grande"
        ? raw.size
        : "Mediano",
    social:
      raw.social === "Selectivo" || raw.social === "Aislado"
        ? raw.social
        : "Amistoso",
    photoUri: normalizeOptionalString(raw.photoUri),
    notes: normalizeOptionalString(raw.notes),
    temperament: normalizeOptionalString(raw.temperament),
    specialCare: normalizeOptionalString(raw.specialCare),
  };
}

export const usePetsStore = create<State>((set, get) => ({
  pets: [],
  hydrated: false,

  addPet: (pet) => {
    set((state) => ({
      pets: [{ ...pet, id: newId() }, ...state.pets],
    }));
    void get().persist();
  },

  removePet: (id) => {
    set((s) => ({ pets: s.pets.filter((p) => p.id !== id) }));
    void get().persist();
  },

  updatePet: (id, patch) => {
    set((s) => ({
      pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    void get().persist();
  },

  persist: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().pets));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const normalized = list.map((item) =>
        normalizeHydratedPet(item as Partial<Pet> & Record<string, unknown>),
      );
      const { fixed, changed } = fixDuplicateIds(normalized);
      const nextRaw = JSON.stringify(fixed);

      set({ pets: fixed, hydrated: true });
      if (changed || raw !== nextRaw) {
        await AsyncStorage.setItem(STORAGE_KEY, nextRaw);
      }
    } catch {
      set({ hydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ pets: [] });
  },
}));
