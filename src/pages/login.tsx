import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { AuthLayout } from "../components/layout/auth-layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { login, sendPasswordReset } from "../utils/auth";
import { useEncryptionKey } from "../contexts/EncryptionKeyContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

export function LoginPage() {
  const navigate = useNavigate();
  const { deriveKey, storeEncryptedKey } = useEncryptionKey();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const { user, error } = await login(formData.email, formData.password);
    if (error) {
      toast.error(error.message, { position: "top-right" });
      setIsLoading(false);
      return;
    }

    if (user) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const key = deriveKey(formData.password);
            await storeEncryptedKey(key);
            toast.success("Logged in successfully!", { position: "top-right" });
            navigate("/dashboard");
          } catch (err: any) {
            console.error("Error storing encryption key:", err);
            toast.error(
              "Failed to set up encryption key: " +
                (err.message || "Unknown error"),
              { position: "top-right" }
            );
          } finally {
            setIsLoading(false);
            unsubscribe();
          }
        } else {
          toast.error("User authentication failed. Please try again.", {
            position: "top-right",
          });
          setIsLoading(false);
          unsubscribe();
        }
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setResetError("");
    setResetMessage("");

    const { error } = await sendPasswordReset(resetEmail);
    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage("Password reset email sent. Check your inbox.");
      toast.success("Password reset email sent!", { position: "top-right" });
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Sign in to SafePass"
      subtitle="Your secure password and notes vault"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
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
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-200 animate-slide-in"
              id="email-error"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
          />
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-200 animate-slide-in"
              id="password-error"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="text-sm text-white opacity-80 hover:opacity-100 hover:underline transition-opacity duration-300"
          >
            Forgot your password?
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            className="w-full bg-white text-blue-600 font-semibold py-3 rounded-full hover:bg-blue-100 hover:scale-105 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        {/* Signup Link */}
        <div className="text-sm text-center text-white opacity-80">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-white hover:underline hover:opacity-100 transition-opacity duration-300"
          >
            Sign up
          </Link>
        </div>
      </form>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-md border border-white/20"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Reset Password
              </h2>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-500/20 border border-green-500 p-4 animate-slide-in"
                  >
                    <div className="text-sm text-green-200">{resetMessage}</div>
                  </motion.div>
                )}
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-500/20 border border-red-500 p-4 animate-slide-in"
                  >
                    <div className="text-sm text-red-200">{resetError}</div>
                  </motion.div>
                )}
                <Input
                  label="Email address"
                  type="email"
                  name="resetEmail"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError("");
                    setResetMessage("");
                  }}
                  placeholder="Enter your email"
                  required
                  aria-invalid={!!resetError}
                  aria-describedby={
                    resetError ? "reset-email-error" : undefined
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetModalOpen(false)}
                    disabled={isLoading}
                    className="bg-transparent border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-full hover:bg-blue-100 hover:scale-105 transition-all duration-300"
                  >
                    {isLoading ? "Sending..." : "Send Reset Email"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
