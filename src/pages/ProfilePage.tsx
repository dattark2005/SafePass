import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../utils/firebase";
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";

export function ProfilePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth state and load current user email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log("ProfilePage - User authenticated:", user.uid);
        setEmail(user.email || "");
        setNewEmail(user.email || "");
      } else {
        // console.error("ProfilePage - No user authenticated");
        toast.error("Please log in to update your profile.");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Re-authenticate user with current password
  const reauthenticateUser = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user is signed in or email is missing.");
    }

    if (!currentPassword) {
      throw new Error("Please enter your current password to proceed.");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    try {
      await reauthenticateWithCredential(user, credential);
      // console.log("ProfilePage - User re-authenticated successfully");
    } catch (err: any) {
      throw new Error(
        "Re-authentication failed. Please check your current password."
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is signed in.");
      }

      // Validate email
      if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
        throw new Error("Please enter a valid email address.");
      }

      // Validate password (if provided)
      if (newPassword && newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Re-authenticate user
      await reauthenticateUser();

      // Update email if changed
      if (newEmail !== email) {
        // console.log("ProfilePage - Updating email to:", newEmail);
        await updateEmail(user, newEmail);
      }

      // Update password if provided
      if (newPassword) {
        // console.log("ProfilePage - Updating password");
        await updatePassword(user, newPassword);
      }

      toast.success("Profile updated successfully!");
      setCurrentPassword(""); // Clear current password field
      setNewPassword(""); // Clear password field after update
    } catch (err: any) {
      console.error("ProfilePage - Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 font-poppins"
    >
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Update Profile
        </h2>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-500/20 border border-red-500 p-4 mb-6"
          >
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Current Email Address"
              type="email"
              value={email}
              disabled
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
            />
          </div>
          <div>
            <Input
              label="New Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
            />
          </div>
          <div>
            <Input
              label="Current Password (required)"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
            />
          </div>
          <div>
            <Input
              label="New Password (optional)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
              className="bg-transparent border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-full hover:bg-blue-100 hover:scale-105 transition-all duration-300"
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
