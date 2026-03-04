// src/auth/google.ts
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const EXPO_PROXY_REDIRECT_URI = "https://auth.expo.io/@charllytwin/tiopet";

export function useGoogleAuth() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId)
    throw new Error("Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env");

  // Para Expo Go: usa el WEB client id + redirectUri del proxy
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    iosClientId,
    redirectUri: EXPO_PROXY_REDIRECT_URI,
    scopes: ["profile", "email"],
  });

  const signInWithGoogle = async () => {
    const res = await promptAsync();

    if (res.type !== "success") return null;

    // En useIdTokenAuthRequest el id_token llega en params
    const idToken = (res.params as any)?.id_token;

    if (!idToken) {
      throw new Error(
        "Google no devolvió id_token. Revisa redirectUri y clientId.",
      );
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
  };

  return { request, response, signInWithGoogle };
}
