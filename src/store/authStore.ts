import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    signOut as fbSignOut,
    onAuthStateChanged,
    signInAnonymously,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../lib/firebase";

const STORAGE_KEY = "tiopet_auth_user_v1";

export type AuthUser = {
  uid: string;
  email?: string | null;
  provider?: string;
};

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  loading: boolean;

  hydrate: () => Promise<void>;
  signInAnon: () => Promise<void>;
  signOut: () => Promise<void>;
};

function mapFbUser(u: any): AuthUser {
  const provider =
    u?.providerData?.[0]?.providerId ??
    (u?.isAnonymous ? "anonymous" : "unknown");

  return {
    uid: u.uid,
    email: u.email,
    provider,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  loading: false,

  hydrate: async () => {
    try {
      // 1) carga cache (opcional)
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ user: JSON.parse(raw) as AuthUser });

      // 2) escucha Firebase Auth real
      onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          set({ user: null, hydrated: true });
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }

        const mapped = mapFbUser(fbUser);
        set({ user: mapped, hydrated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      });
    } catch {
      set({ hydrated: true });
    }
  },

  signInAnon: async () => {
    set({ loading: true });
    try {
      await signInAnonymously(auth);
      // el listener de onAuthStateChanged actualiza user
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await fbSignOut(auth);
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
