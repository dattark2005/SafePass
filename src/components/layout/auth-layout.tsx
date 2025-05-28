import React from "react";
import { Lock } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 font-poppins">
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-md border border-white/20 animate-fade-in">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <Lock className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white opacity-80">{subtitle}</p>
        </div>

        {/* Children (Form) */}
        {children}
      </div>
    </div>
  );
}
// Tailwind CSS animations
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-in-out;
}
`;
