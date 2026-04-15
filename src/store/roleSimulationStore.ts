import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type SimulationRole = "caregiver" | "client";

type RoleSimulationState = {
  role: SimulationRole;
  hydrated: boolean;
  setRole: (role: SimulationRole) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_role_simulation_v1";

function normalizeRole(value: unknown): SimulationRole {
  return value === "client" ? "client" : "caregiver";
}

export const useRoleSimulationStore = create<RoleSimulationState>((set, get) => ({
  role: "caregiver",
  hydrated: false,

  setRole: (role) => {
    const nextRole = normalizeRole(role);

    set((state) => (state.role === nextRole ? state : { role: nextRole }));
    void get().persist();
  },

  persist: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ role: get().role }));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as { role?: unknown }) : null;
      const role = normalizeRole(parsed?.role);

      set({ role, hydrated: true });

      if (!raw || parsed?.role !== role) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ role }));
      }
    } catch {
      set({ role: "caregiver", hydrated: true });
    }
  },
}));
