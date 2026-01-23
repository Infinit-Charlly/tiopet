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
  addPet: (pet: Omit<Pet, "id">) => void;
};

export const usePetsStore = create<State>((set) => ({
  pets: [],
  addPet: (pet) =>
    set((state) => ({
      pets: [{ ...pet, id: String(Date.now()) }, ...state.pets],
    })),
}));
