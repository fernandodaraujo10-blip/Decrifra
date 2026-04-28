import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type Plan = 'free' | 'pro' | 'premium';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: Plan;
  usage?: {
    daily: number;
    monthly: number;
    lastDay: string;
    lastMonth: string;
  };
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Serviço de Autenticação não disponível.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Garantir que o usuário existe no Firestore
    await ensureUserInFirestore(user);
    
    return user;
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Se não houver auth, retorna um unsubscribe vazio e chama o callback com null
    setTimeout(() => callback(null), 0);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      if (!db) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          plan: 'free'
        });
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            plan: userData.plan || 'free',
            usage: userData.usage
          });
        } else {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            plan: 'free'
          });
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          plan: 'free'
        });
      }
    } else {
      callback(null);
    }
  });
};

const ensureUserInFirestore = async (user: FirebaseUser) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const now = new Date();
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      plan: 'free',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      usage: {
        daily: 0,
        monthly: 0,
        lastDay: now.toISOString().split('T')[0],
        lastMonth: `${now.getFullYear()}-${now.getMonth() + 1}`
      }
    });
  } else {
    await setDoc(userRef, {
      lastLogin: serverTimestamp(),
    }, { merge: true });
  }
};
