import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import { Note } from "../../types";
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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { key } = useEncryptionKey();
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [decryptionError, setDecryptionError] = useState<string>("");

  useEffect(() => {
    if (key) {
      try {
        const content = decryptData(note.content, key);
        setDecryptedContent(content);
        setDecryptionError("");
      } catch (error) {
        setDecryptionError("Failed to decrypt note content.");
        setDecryptedContent("");
      }
    } else {
      setDecryptionError("Encryption key not available.");
      setDecryptedContent("");
    }
  }, [note.content, key]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:border-pink-400 border border-gray-200 rounded-2xl bg-gradient-to-br from-indigo-300 via-white to-yellow-200 text-gray-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-pink-800 font-serif">
            {note.title}
          </CardTitle>
          {note.category && (
            <span className="inline-flex items-center rounded-full bg-pink-200 px-3 py-0.5 text-xs font-medium text-pink-900 font-mono">
              {note.category}
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
          <div className="prose prose-sm max-w-none font-sans text-gray-800">
            <p className="whitespace-pre-line">{decryptedContent}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4 italic">
          Updated {formatDate(note.updatedAt)}
        </p>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(note)}
          className="text-gray-600 hover:text-pink-700 transition-colors duration-300"
          aria-label={`Edit ${note.title}`}
          disabled={!!decryptionError}
        >
          <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(note.id)}
          className="text-gray-600 hover:text-red-600 transition-colors duration-300"
          aria-label={`Delete ${note.title}`}
        >
          <Trash className="h-4 w-4 mr-1" aria-hidden="true" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
