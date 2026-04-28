import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase fornecida
const firebaseConfig = {
  apiKey: "AIzaSyBmBZk6_2hi_Wkl_BTi3UBTtESanRsKPCI",
  authDomain: "decifra-premium.firebaseapp.com",
  projectId: "decifra-premium",
  storageBucket: "decifra-premium.firebasestorage.app",
  messagingSenderId: "1066929654773",
  appId: "1:1066929654773:web:f184b5e6d9bed7157ceebc",
  measurementId: "G-C8MD85DBFN"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias para uso no app
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'southamerica-east1');

export default app;
