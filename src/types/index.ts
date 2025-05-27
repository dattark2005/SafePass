export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  category?: string;
  notes?: string;
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