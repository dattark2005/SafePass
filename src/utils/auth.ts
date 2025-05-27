import { User } from '../types';

// Mock authentication for demo purposes
// In a real app, this would use a proper authentication system

let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User> => {
  // Mock login - in a real app, this would validate against a backend
  if (email && password.length >= 6) {
    currentUser = {
      id: '1',
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem('safepass_user', JSON.stringify(currentUser));
    return currentUser;
  }
  throw new Error('Invalid email or password');
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
  // Mock signup - in a real app, this would create a user in the backend
  if (email && password.length >= 6) {
    currentUser = {
      id: '1',
      email,
      name: name || email.split('@')[0],
    };
    localStorage.setItem('safepass_user', JSON.stringify(currentUser));
    return currentUser;
  }
  throw new Error('Invalid email or password');
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem('safepass_user');
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const storedUser = localStorage.getItem('safepass_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};