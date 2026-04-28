"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPlan = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
exports.verifyPlan = (0, https_1.onCall)({
    region: "southamerica-east1",
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Usuário não autenticado.");
    }
    const uid = request.auth.uid;
    const db = (0, firestore_1.getFirestore)();
    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
        return { plan: "free" };
    }
    const data = userDoc.data();
    const plan = data?.plan === "premium" ? "premium" : "free";
    const activatedAt = data?.planActivatedAt
        ? data.planActivatedAt.toDate().toISOString()
        : undefined;
    return { plan, ...(activatedAt ? { activatedAt } : {}) };
});
//# sourceMappingURL=verifyPlan.js.map