// src/auth/google.ts
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const EXPO_PROXY_REDIRECT_URI = "https://auth.expo.io/@charllytwin/tiopet";
const GOOGLE_WEB_CLIENT_ID_PLACEHOLDER = "google-auth-disabled";

export function useGoogleAuth() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const isGoogleAuthConfigured = Boolean(webClientId);

  // Para Expo Go: usa el WEB client id + redirectUri del proxy
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId ?? GOOGLE_WEB_CLIENT_ID_PLACEHOLDER,
    iosClientId,
    redirectUri: EXPO_PROXY_REDIRECT_URI,
    scopes: ["profile", "email"],
  });

  const signInWithGoogle = async () => {
    if (!isGoogleAuthConfigured) return null;

    const res = await promptAsync();

    if (res.type !== "success") return null;

    // En useIdTokenAuthRequest el id_token llega en params
    const idToken = (res.params as any)?.id_token;

    if (!idToken) {
      throw new Error(
        "Google no devolvio id_token. Revisa redirectUri y clientId.",
      );
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
  };

  return {
    request: isGoogleAuthConfigured ? request : null,
    response: isGoogleAuthConfigured ? response : null,
    signInWithGoogle,
  };
}
