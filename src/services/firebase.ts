import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfigValid = !!firebaseConfig.apiKey;

// Inicializa o Firebase apenas se a configuração básica estiver presente
// Caso contrário, exporta instâncias vazias ou lança erro controlado
const app = isConfigValid ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;
export const functions = app ? getFunctions(app, "southamerica-east1") : null as any;

if (!isConfigValid) {
  console.warn("⚠️ Firebase: VITE_FIREBASE_API_KEY não encontrada em .env.local. Algumas funcionalidades (Auth/DB) estarão desabilitadas.");
}
