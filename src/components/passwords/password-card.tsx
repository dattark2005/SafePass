import React, { useState, useEffect } from "react";
import { Edit, Trash, Eye, EyeOff } from "lucide-react";
import { Password } from "../../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { decryptData } from "../../utils/encryption";
import { useEncryptionKey } from "../../contexts/EncryptionKeyContext";

interface PasswordCardProps {
  password: Password;
  onEdit: (password: Password) => void;
  onDelete: (id: string) => void;
}

export function PasswordCard({
  password,
  onEdit,
  onDelete,
}: PasswordCardProps) {
  const { key } = useEncryptionKey();
  const [decryptedPassword, setDecryptedPassword] = useState("");
  const [decryptedNotes, setDecryptedNotes] = useState("");
  const [decryptionError, setDecryptionError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (key) {
      // console.log("PasswordCard - Decrypting data with key:", key);
      try {
        setDecryptedPassword(decryptData(password.password, key));
        if (password.notes) {
          setDecryptedNotes(decryptData(password.notes, key));
          // console.log(
          //   "PasswordCard - Successfully decrypted notes:",
          //   decryptedNotes
          // );
        } else {
          // console.log(
          //   "PasswordCard - No notes to decrypt - notes field is null or undefined"
          // );
        }
        setDecryptionError("");
        // console.log(
        //   "PasswordCard - Successfully decrypted password:",
        //   decryptedPassword
        // );
      } catch (err) {
        console.error("PasswordCard - Decryption error:", err);
        setDecryptionError(
          "Unable to decrypt password or notes. Please log in again."
        );
      }
    } else {
      console.error("PasswordCard - Encryption key not available");
      setDecryptionError("Encryption key not available. Please log in again.");
    }
  }, [password.password, password.notes, key]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="mb-4 overflow-hidden border border-gray-300 rounded-2xl shadow-md bg-gradient-to-br from-indigo-400 via-white to-red-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out hover:border-indigo-400 text-gray-800 font-medium hover:text-indigo-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{password.title}</CardTitle>
          {password.category && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              {password.category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {decryptionError ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{decryptionError}</div>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Username:</strong> {password.username}
            </p>
            <p>
              <strong>Password:</strong>{" "}
              {showPassword ? decryptedPassword : "••••••••"}{" "}
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 inline" />
                ) : (
                  <Eye className="h-4 w-4 inline" />
                )}
              </button>
            </p>
            {password.url && (
              <p>
                <strong>URL:</strong>{" "}
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {password.url}
                </a>
              </p>
            )}
            {decryptedNotes && (
              <p>
                <strong>Notes:</strong> {decryptedNotes}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-4">
              Updated {formatDate(password.updatedAt)}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(password)}
          className="text-gray-600 hover:text-indigo-600"
          aria-label={`Edit ${password.title}`}
          disabled={!!decryptionError}
        >
          <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(password.id)}
          className="text-gray-600 hover:text-red-500"
          aria-label={`Delete ${password.title}`}
        >
          <Trash className="h-4 w-4 mr-1" aria-hidden="true" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
