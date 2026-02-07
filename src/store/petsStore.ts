import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type PetType = "Perro" | "Gato";
export type Sex = "Macho" | "Hembra";
export type Size = "Pequeño" | "Mediano" | "Grande";
export type Social = "Amistoso" | "Selectivo" | "Aislado";

export type Pet = {
  id: string;
  type: PetType;
  name: string;
  sex: Sex;
  age: string;
  size: Size;
  social: Social;
};

type State = {
  pets: Pet[];
  hydrated: boolean;

  addPet: (pet: Omit<Pet, "id">) => void;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_pets_v1";
const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const usePetsStore = create<State>((set, get) => ({
  pets: [],
  hydrated: false,

  addPet: (pet) => {
    set((state) => ({
      pets: [{ ...pet, id: newId() }, ...state.pets],
    }));
    void get().persist();
  },

  persist: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().pets));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const pets = raw ? (JSON.parse(raw) as Pet[]) : [];
      set({ pets, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ pets: [] });
  },
}));
