import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { logout } from '../../utils/auth';

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 text-indigo-600">
              <Shield className="h-6 w-6" />
              <span className="text-xl font-bold">SafePass</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}