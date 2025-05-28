import React, { useState, useEffect } from "react";
import { Note } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { encryptData, decryptData } from "../../utils/encryption";
import { useEncryptionKey } from "../../contexts/EncryptionKeyContext";

interface NoteFormProps {
  initialData?: Note;
  onSubmit: (data: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function NoteForm({ initialData, onSubmit, onCancel }: NoteFormProps) {
  const { key } = useEncryptionKey();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content:
      initialData?.content && key ? decryptData(initialData.content, key) : "",
    category: initialData?.category || "",
    userId: initialData?.userId || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when initialData or key changes
  useEffect(() => {
    if (initialData && key) {
      try {
        setFormData({
          title: initialData.title,
          content: decryptData(initialData.content, key),
          category: initialData.category || "",
          userId: initialData.userId,
        });
      } catch (error) {
        setErrors({ form: "Failed to decrypt note content." });
      }
    }
  }, [initialData, key]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!key) {
      setErrors({ form: "Encryption key not available. Please log in again." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const encryptedData: Omit<Note, "id" | "createdAt" | "updatedAt"> = {
        title: formData.title,
        content: encryptData(formData.content, key),
        category: formData.category || undefined,
      };

      onSubmit(encryptedData);
    } catch (error) {
      setErrors({ form: "Failed to encrypt or save note. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{errors.form}</div>
        </div>
      )}

      <Input
        label="Title"
        name="title"
        id="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Note Title"
        error={errors.title}
        required
        aria-invalid={!!errors.title}
        aria-describedby={errors.title ? "title-error" : undefined}
      />

      <Input
        label="Category (optional)"
        name="category"
        id="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="e.g., Personal, Work, Recipes"
        error={errors.category}
        aria-describedby={errors.category ? "category-error" : undefined}
      />

      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          name="content"
          id="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your note here..."
          rows={8}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.content
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          required
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
        {errors.content && (
          <p className="text-sm text-red-600" id="content-error">
            {errors.content}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Note" : "Save Note"}
        </Button>
      </div>
    </form>
  );
}
