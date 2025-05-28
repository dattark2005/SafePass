import React, { createContext, useContext, useState, ReactNode } from "react";
import { auth, db } from "../utils/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

interface EncryptionKeyContextType {
  deriveKey: (password: string) => string;
  storeEncryptedKey: (key: string) => Promise<void>;
  getDecryptedKey: (password?: string) => Promise<string | null>;
  updateKey: (newPassword: string) => Promise<void>;
  key: string | null; // Add key to context
  setKey: (key: string | null) => void; // Add this line
}

const EncryptionKeyContext = createContext<
  EncryptionKeyContextType | undefined
>(undefined);

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY;

export const EncryptionKeyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [key, setKey] = useState<string | null>(null); // Store the decrypted key in state

  const deriveKey = (password: string): string => {
    const salt = "safepass-salt";
    const derivedKey = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
    }).toString();
    // console.log("EncryptionKeyContext - Derived key:", derivedKey);
    return derivedKey;
  };

  const storeEncryptedKey = async (key: string) => {
    const user = auth.currentUser;
    // console.log("storeEncryptedKey - User:", user);
    if (!user) {
      console.error("storeEncryptedKey - No authenticated user found");
      throw new Error("User not authenticated");
    }

    const encryptedKey = CryptoJS.AES.encrypt(key, MASTER_KEY).toString();
    // console.log("storeEncryptedKey - Encrypted Key:", encryptedKey);

    try {
      await setDoc(
        doc(db, `users/${user.uid}/encryption/key`),
        { encryptedKey },
        { merge: true }
      );
      // console.log("storeEncryptedKey - Successfully wrote to Firestore");
      setKey(key); // Store the key in context
      // console.log("storeEncryptedKey - Key set in context:", key);
    } catch (err) {
      // console.error("storeEncryptedKey - Failed to write to Firestore:", err);
      toast.error("Failed to store encryption key. Please log in again.");
      throw err;
    }
  };

  const getDecryptedKey = async (
    password?: string,
    retries = 3,
    delay = 1000
  ): Promise<string | null> => {
    // If key is already in context, return it
    if (key) {
      // console.log("getDecryptedKey - Returning key from context:", key);
      return key;
    }

    const user = auth.currentUser;
    // console.log("getDecryptedKey - User:", user);
    if (!user) {
      console.error("getDecryptedKey - No authenticated user found");
      return null;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const keyDoc = await getDoc(
          doc(db, `users/${user.uid}/encryption/key`)
        );
        // console.log(
        //   "getDecryptedKey - Attempt:",
        //   attempt,
        //   "Document exists:",
        //   keyDoc.exists()
        // );

        if (!keyDoc.exists() || !keyDoc.data()?.encryptedKey) {
          if (password) {
            const derivedKey = deriveKey(password);
            await storeEncryptedKey(derivedKey);
            return derivedKey;
          }
          // console.warn(
          //   `getDecryptedKey - Attempt ${attempt}: Key document or encryptedKey missing`
          // );
          if (attempt === retries) {
            // console.error(
            //   "getDecryptedKey - Max retries reached, key not found"
            // );
            return null;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        const { encryptedKey } = keyDoc.data();
        // console.log("getDecryptedKey - Encrypted Key:", encryptedKey);
        if (!encryptedKey) {
          console.warn(
            `getDecryptedKey - Attempt ${attempt}: encryptedKey is empty`
          );
          if (attempt === retries) {
            console.error(
              "getDecryptedKey - Max retries reached, encryptedKey empty"
            );
            return null;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        const bytes = CryptoJS.AES.decrypt(encryptedKey, MASTER_KEY);
        const decryptedKey = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedKey) {
          console.error(
            `getDecryptedKey - Attempt ${attempt}: Decryption failed. Encrypted Key: ${encryptedKey}, MASTER_KEY: ${MASTER_KEY}`
          );
          if (attempt === retries) {
            console.error(
              "getDecryptedKey - Max retries reached, decryption failed"
            );
            toast.error(
              "Failed to decrypt encryption key. The key may be corrupted or encrypted with a different MASTER_KEY."
            );
            return null;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // console.log("getDecryptedKey - Decrypted Key:", decryptedKey);
        setKey(decryptedKey); // Store the decrypted key in context
        // console.log("getDecryptedKey - Key set in context:", decryptedKey);
        return decryptedKey;
      } catch (err) {
        console.error(`getDecryptedKey - Error on attempt ${attempt}:`, err);
        if (attempt === retries) {
          // console.error(
          //   "getDecryptedKey - Max retries reached, failed to decrypt key"
          // );
          toast.error(
            "Failed to retrieve encryption key after multiple attempts."
          );
          return null;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    // console.error("getDecryptedKey - Exhausted retries, returning null");
    return null;
  };

  const updateKey = async (newPassword: string) => {
    const user = auth.currentUser;
    if (!user) {
      // console.error("updateKey - No authenticated user found");
      throw new Error("User not authenticated");
    }

    const newKey = deriveKey(newPassword);
    const currentKey = await getDecryptedKey();
    if (!currentKey) {
      // console.log("updateKey - No current key found, storing new key");
      await storeEncryptedKey(newKey);
      return;
    }

    const passwordsSnapshot = await getDocs(
      collection(db, `users/${user.uid}/passwords`)
    );
    const notesSnapshot = await getDocs(
      collection(db, `users/${user.uid}/notes`)
    );

    for (const passwordDoc of passwordsSnapshot.docs) {
      const data = passwordDoc.data();
      const updates: { password?: string; notes?: string | null } = {};

      if (data.password) {
        try {
          const decryptedPassword = CryptoJS.AES.decrypt(
            data.password,
            currentKey
          ).toString(CryptoJS.enc.Utf8);
          if (!decryptedPassword) {
            // console.error(
            //   `updateKey - Password decryption failed for doc ${passwordDoc.id}`
            // );
            continue;
          }
          const reEncryptedPassword = CryptoJS.AES.encrypt(
            decryptedPassword,
            newKey
          ).toString();
          updates.password = reEncryptedPassword;
        } catch (err) {
          // console.error(
          //   `Failed to re-encrypt password for doc ${passwordDoc.id}:`,
          //   err
          // );
          continue;
        }
      }

      if (data.notes) {
        try {
          const decryptedNotes = CryptoJS.AES.decrypt(
            data.notes,
            currentKey
          ).toString(CryptoJS.enc.Utf8);
          if (!decryptedNotes) {
            // console.error(
            //   `updateKey - Notes decryption failed for doc ${passwordDoc.id}`
            // );
            updates.notes = null;
            continue;
          }
          const reEncryptedNotes = CryptoJS.AES.encrypt(
            decryptedNotes,
            newKey
          ).toString();
          updates.notes = reEncryptedNotes;
        } catch (err) {
          // console.error(
          //   `Failed to re-encrypt notes for doc ${passwordDoc.id}:`,
          //   err
          // );
          updates.notes = null;
        }
      }

      if (Object.keys(updates).length > 0) {
        try {
          await updateDoc(
            doc(db, `users/${user.uid}/passwords`, passwordDoc.id),
            updates
          );
          // console.log(`updateKey - Successfully updated doc ${passwordDoc.id}`);
        } catch (err) {
          // console.error(
          //   `updateKey - Failed to update doc ${passwordDoc.id}:`,
          //   err
          // );
        }
      }
    }

    for (const noteDoc of notesSnapshot.docs) {
      const data = noteDoc.data();
      if (data.content) {
        try {
          const decryptedContent = CryptoJS.AES.decrypt(
            data.content,
            currentKey
          ).toString(CryptoJS.enc.Utf8);
          if (!decryptedContent) {
            // console.error(
            //   `updateKey - Content decryption failed for note doc ${noteDoc.id}`
            // );
            await updateDoc(doc(db, `users/${user.uid}/notes`, noteDoc.id), {
              content: null,
            });
            continue;
          }
          const reEncryptedContent = CryptoJS.AES.encrypt(
            decryptedContent,
            newKey
          ).toString();
          await updateDoc(doc(db, `users/${user.uid}/notes`, noteDoc.id), {
            content: reEncryptedContent,
          });
          // console.log(
          //   `updateKey - Successfully updated note doc ${noteDoc.id}`
          // );
        } catch (err) {
          // console.error(
          //   `Failed to re-encrypt content for note doc ${noteDoc.id}:`,
          //   err
          // );
          await updateDoc(doc(db, `users/${user.uid}/notes`, noteDoc.id), {
            content: null,
          });
        }
      }
    }

    await storeEncryptedKey(newKey);
    toast.success("Encryption key updated successfully!");
  };

  return (
    <EncryptionKeyContext.Provider
      value={{
        deriveKey,
        storeEncryptedKey,
        getDecryptedKey,
        updateKey,
        key,
        setKey,
      }}
    >
      {children}
    </EncryptionKeyContext.Provider>
  );
};

export const useEncryptionKey = () => {
  const context = useContext(EncryptionKeyContext);
  if (!context) {
    throw new Error(
      "useEncryptionKey must be used within an EncryptionKeyProvider"
    );
  }
  return context;
};
