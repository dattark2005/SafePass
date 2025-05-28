import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { auth } from "../../utils/firebase";
import { logout } from "../../utils/auth";
import { LogOut, User, ChevronDown } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user email on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await logout(); // Remove setKey since it's no longer needed
    if (error) {
      toast.error(error.message, { position: "top-right" });
    } else {
      toast.success("Logged out successfully!", { position: "top-right" });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-white">
            SafePass
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none transition-colors"
            >
              <span className="text-sm">{userEmail || "User"}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
