import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

export const verifyPlan = onCall(
  {
    region: "southamerica-east1",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Usuário não autenticado.");
    }

    const uid = request.auth.uid;
    const db = getFirestore();

    const userDoc = await db.doc(`users/${uid}`).get();

    if (!userDoc.exists) {
      return { plan: "free" };
    }

    const data = userDoc.data() as {
      plan?: string;
      planActivatedAt?: { toDate: () => Date };
    };

    const plan = data?.plan === "premium" ? "premium" : "free";
    const activatedAt = data?.planActivatedAt
      ? data.planActivatedAt.toDate().toISOString()
      : undefined;

    return { plan, ...(activatedAt ? { activatedAt } : {}) };
  }
);
