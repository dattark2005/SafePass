import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { logout } from "../../utils/auth";
import { useEncryptionKey } from "../../contexts/EncryptionKeyContext";

export function Navbar() {
  const navigate = useNavigate();
  const { setKey } = useEncryptionKey();
  const [isLoading, setIsLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setIsLoading(true);
    setLogoutError("");

    try {
      const { error } = await logout();
      if (error) {
        setLogoutError(error.message);
        setIsLoading(false);
        return;
      }

      // Clear encryption key
      setKey(null);
      navigate("/login");
    } catch (error) {
      setLogoutError("Failed to log out. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Shield
                className="h-8 w-8 text-white opacity-90"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold text-white tracking-tight">
                SafePass
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {logoutError && (
              <div className="rounded-lg bg-red-500/20 border border-red-500 p-2 animate-slide-in">
                <div className="text-sm text-red-200">{logoutError}</div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
              disabled={isLoading}
              className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 rounded-full"
            >
              <Settings className="h-6 w-6" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={handleLogout}
              disabled={isLoading}
              className="text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 rounded-full"
            >
              <LogOut className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
