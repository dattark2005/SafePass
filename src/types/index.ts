export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Password {
  id: string;
  userId: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  notes?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';