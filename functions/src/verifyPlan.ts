import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const verifyPlan = onCall({
  region: "southamerica-east1"
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "O usuário deve estar autenticado.");
  }

  const userId = request.auth.uid;

  try {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return { plan: "free" };
    }

    const userData = userDoc.data();
    return { 
      plan: userData?.plan || "free",
      updatedAt: userData?.updatedAt?.toDate().toISOString() || null
    };
  } catch (error) {
    console.error("Erro ao verificar plano no Firestore:", error);
    throw new HttpsError("internal", "Erro ao buscar dados do plano.");
  }
});
