import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { User } from "../types";
import { doc, setDoc } from "firebase/firestore";

// Interface for auth errors
interface AuthError {
  code: string;
  message: string;
}

// Rate limiting for login attempts
const LOGIN_ATTEMPTS: { [key: string]: { count: number; lastAttempt: number } } = {};
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

// Helper function to format Firebase errors
const formatAuthError = (error: any): AuthError => {
  let message = "An error occurred. Please try again.";
  switch (error.code) {
    case "auth/email-already-in-use":
      message = "This email is already registered.";
      break;
    case "auth/invalid-email":
      message = "Invalid email address.";
      break;
    case "auth/weak-password":
      message = "Password is too weak. Use at least 6 characters.";
      break;
    case "auth/user-not-found":
      message = "No account found with this email. Please register first.";
      break;
    case "auth/wrong-password":
      message = "Incorrect password. Please try again.";
      break;
    case "auth/too-many-requests":
      message = "Too many attempts. Please try again later.";
      break;
    case "auth/no-user":
      message = "No user is signed in.";
      break;
  }
  return { code: error.code, message };
};

// Signup with email and password
export const signup = async (
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    // Initialize user profile in Firestore
    await setDoc(doc(db, `users/${firebaseUser.uid}/profile/data`), {
      photoURL: null, // Default photoURL
      createdAt: new Date(),
    }, { merge: true });

    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      },
      error: null,
    };
  } catch (error: any) {
    return { user: null, error: formatAuthError(error) };
  }
};

// Login with email and password
export const login = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    // Rate limiting
    const now = Date.now();
    if (!LOGIN_ATTEMPTS[email]) {
      LOGIN_ATTEMPTS[email] = { count: 0, lastAttempt: now };
    }

    const attempt = LOGIN_ATTEMPTS[email];
    if (attempt.count >= MAX_ATTEMPTS && now - attempt.lastAttempt < COOLDOWN_MS) {
      return {
        user: null,
        error: { code: "auth/too-many-requests", message: "Too many attempts. Please try again later." },
      };
    }

    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Reset login attempts on successful login
    LOGIN_ATTEMPTS[email] = { count: 0, lastAttempt: now };

    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      },
      error: null,
    };
  } catch (error: any) {
    const now = Date.now();
    LOGIN_ATTEMPTS[email].count += 1;
    LOGIN_ATTEMPTS[email].lastAttempt = now;

    return { user: null, error: formatAuthError(error) };
  }
};

// Logout
export const logout = async (): Promise<{ error: AuthError | null }> => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: formatAuthError(error) };
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  };
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Send password reset email
export const sendPasswordReset = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: formatAuthError(error) };
  }
};

// Update user profile
export const updateUserProfile = async (
  updates: { displayName?: string; photoURL?: string } // Added photoURL support
): Promise<{ error: AuthError | null }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error("updateUserProfile - No user signed in");
      return { error: { code: "auth/no-user", message: "No user is signed in." } };
    }

    // console.log("updateUserProfile - Updating profile with:", updates);
    await updateProfile(user, updates);
    // console.log("updateUserProfile - Profile updated successfully");

    // Update Firestore profile data if photoURL is provided
    if (updates.photoURL) {
      try {
        await setDoc(doc(db, `users/${user.uid}/profile/data`), {
          photoURL: updates.photoURL,
        }, { merge: true });
        // console.log("updateUserProfile - Firestore profile updated with photoURL:", updates.photoURL);
      } catch (err) {
        console.error("updateUserProfile - Failed to update Firestore profile:", err);
        return { error: { code: "firestore/update-failed", message: "Failed to update profile in Firestore." } };
      }
    }

    return { error: null };
  } catch (error: any) {
    // consolstorede.error("updateUserProfile - Error updating profile:", error);
    return { error: formatAuthError(error) };
  }
};