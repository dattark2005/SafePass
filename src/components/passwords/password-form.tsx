import React, { useState, useEffect } from "react";
import { Password } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { encryptData, decryptData } from "../../utils/encryption";
import { useEncryptionKey } from "../../contexts/EncryptionKeyContext";
import { toast } from "react-toastify";
import { auth } from "../../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface PasswordFormProps {
  initialData?: Password;
  onSubmit: (data: Omit<Password, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function PasswordForm({
  initialData,
  onSubmit,
  onCancel,
}: PasswordFormProps) {
  const { key } = useEncryptionKey();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    username: initialData?.username || "",
    password: "",
    url: initialData?.url || "",
    category: initialData?.category || "",
    notes: initialData?.notes || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // console.log("PasswordForm - Auth state changed:", user);
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        console.error("PasswordForm - User signed out unexpectedly");
        toast.error(
          "User not authenticated. Please log in again. [PasswordForm]"
        );
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (initialData && key) {
      // console.log("PasswordForm - Decrypting initial data with key:", key);
      try {
        setFormData({
          title: initialData.title,
          username: initialData.username,
          password: decryptData(initialData.password, key),
          url: initialData.url || "",
          category: initialData.category || "",
          notes: initialData.notes ? decryptData(initialData.notes, key) : "",
        });
        // console.log("PasswordForm - Successfully decrypted initial data");
      } catch (err) {
        console.error("PasswordForm - Decryption error:", err);
        setErrors({
          form: "Unable to decrypt existing password or notes. The data may be corrupted.",
        });
      }
    }
  }, [initialData, key]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isAuthenticated) {
      console.error("PasswordForm - User not authenticated before submit");
      toast.error(
        "User not authenticated. Please log in again. [PasswordForm]"
      );
      navigate("/login");
      return;
    }

    if (!key) {
      console.error(
        "PasswordForm - Encryption key not available before submit"
      );
      toast.error(
        "Encryption key not available. Please log in again. [PasswordForm]"
      );
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // console.log("PasswordForm - Encrypting form data with key:", key);
      const notesToEncrypt = formData.notes.trim();
      const encryptedData: Omit<Password, "id" | "createdAt" | "updatedAt"> = {
        title: formData.title,
        username: formData.username,
        password: encryptData(formData.password, key),
        url: formData.url || undefined,
        category: formData.category || undefined,
        notes: notesToEncrypt ? encryptData(notesToEncrypt, key) : undefined,
        userId: "",
      };
      // console.log("PasswordForm - Encrypted data:", encryptedData);
      onSubmit(encryptedData);
    } catch (err) {
      console.error("PasswordForm - Encryption error:", err);
      setErrors({ form: "Unable to encrypt password or notes." });
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
        placeholder="Password Title"
        error={errors.title}
        required
        aria-invalid={!!errors.title}
        aria-describedby={errors.title ? "title-error" : undefined}
      />
      <Input
        label="Username"
        name="username"
        id="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        error={errors.username}
        required
        aria-invalid={!!errors.username}
        aria-describedby={errors.username ? "username-error" : undefined}
      />
      <Input
        label="Password"
        name="password"
        id="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        error={errors.password}
        required
        aria-invalid={!!errors.password}
        aria-describedby={errors.password ? "password-error" : undefined}
      />
      <Input
        label="URL (optional)"
        name="url"
        id="url"
        value={formData.url}
        onChange={handleChange}
        placeholder="e.g., https://example.com"
        error={errors.url}
        aria-describedby={errors.url ? "url-error" : undefined}
      />
      <Input
        label="Category (optional)"
        name="category"
        id="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="e.g., Work, Personal"
        error={errors.category}
        aria-describedby={errors.category ? "category-error" : undefined}
      />
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes (optional)
        </label>
        <textarea
          name="notes"
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          rows={4}
          className={`mt-1 block w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.notes
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          aria-describedby={errors.notes ? "notes-error" : undefined}
        />
        {errors.notes && (
          <p className="text-sm text-red-600" id="notes-error">
            {errors.notes}
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
        <Button type="submit" disabled={isLoading || !isAuthenticated}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Password"
            : "Save Password"}
        </Button>
      </div>
    </form>
  );
}
