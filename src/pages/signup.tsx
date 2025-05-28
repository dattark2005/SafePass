import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/auth-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { signup } from "../utils/auth";
import { useEncryptionKey } from "../contexts/EncryptionKeyContext";
import CryptoJS from "crypto-js";

export function SignupPage() {
  const navigate = useNavigate();
  const { setKey } = useEncryptionKey();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (signupError) {
      setSignupError("");
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setSignupError("");

    const { user, error } = await signup(
      formData.email,
      formData.password,
      formData.name
    );
    if (error) {
      setSignupError(error.message);
      setIsLoading(false);
      return;
    }

    if (user) {
      // Generate encryption key using PBKDF2
      const masterPassword = formData.password; // In production, prompt for a separate master password
      const salt = "safepass-salt"; // Use a fixed salt; in production, store per user
      const key = CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: 256 / 32,
      }).toString();
      setKey(key);

      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join SafePass to securely store your passwords and notes"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {signupError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{signupError}</div>
          </div>
        )}

        <Input
          label="Name"
          type="text"
          name="name"
          id="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
        />

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>

        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
