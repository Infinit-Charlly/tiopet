import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export async function signInWithGoogle(webClientId: string) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "tiopet",
  });

  const request = new AuthSession.AuthRequest({
    clientId: webClientId,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: {
      nonce: "tiopet_nonce",
    },
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== "success") return null;

  const idToken = (result.params as any).id_token;
  if (!idToken) throw new Error("No id_token returned from Google");

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
