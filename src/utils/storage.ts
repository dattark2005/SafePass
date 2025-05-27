import { Password, Note } from '../types';

// Mock database using localStorage for demo purposes
// In a real app, this would use a proper backend or encrypted local storage

const PASSWORDS_KEY = 'safepass_passwords';
const NOTES_KEY = 'safepass_notes';

// Password functions
export const getPasswords = (): Password[] => {
  const stored = localStorage.getItem(PASSWORDS_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt)
  }));
};

export const savePassword = (password: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>): Password => {
  const passwords = getPasswords();
  const now = new Date();
  
  const newPassword: Password = {
    ...password,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: now,
    updatedAt: now,
  };
  
  passwords.push(newPassword);
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  
  return newPassword;
};

export const updatePassword = (id: string, data: Partial<Omit<Password, 'id' | 'createdAt' | 'updatedAt'>>): Password | null => {
  const passwords = getPasswords();
  const index = passwords.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  const updatedPassword: Password = {
    ...passwords[index],
    ...data,
    updatedAt: new Date(),
  };
  
  passwords[index] = updatedPassword;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  
  return updatedPassword;
};

export const deletePassword = (id: string): boolean => {
  const passwords = getPasswords();
  const filtered = passwords.filter(p => p.id !== id);
  
  if (filtered.length === passwords.length) return false;
  
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(filtered));
  return true;
};

// Note functions
export const getNotes = (): Note[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((n: any) => ({
    ...n,
    createdAt: new Date(n.createdAt),
    updatedAt: new Date(n.updatedAt)
  }));
};

export const saveNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
  const notes = getNotes();
  const now = new Date();
  
  const newNote: Note = {
    ...note,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: now,
    updatedAt: now,
  };
  
  notes.push(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  
  return newNote;
};

export const updateNote = (id: string, data: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Note | null => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === id);
  
  if (index === -1) return null;
  
  const updatedNote: Note = {
    ...notes[index],
    ...data,
    updatedAt: new Date(),
  };
  
  notes[index] = updatedNote;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  
  return updatedNote;
};

export const deleteNote = (id: string): boolean => {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  
  if (filtered.length === notes.length) return false;
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  return true;
};

// Search function
export const searchItems = (query: string) => {
  if (!query.trim()) {
    return {
      passwords: getPasswords(),
      notes: getNotes()
    };
  }
  
  const lowercaseQuery = query.toLowerCase();
  const passwords = getPasswords().filter(p => 
    p.title.toLowerCase().includes(lowercaseQuery) || 
    p.username.toLowerCase().includes(lowercaseQuery) || 
    (p.website && p.website.toLowerCase().includes(lowercaseQuery)) ||
    (p.category && p.category.toLowerCase().includes(lowercaseQuery)) ||
    (p.notes && p.notes.toLowerCase().includes(lowercaseQuery))
  );
  
  const notes = getNotes().filter(n => 
    n.title.toLowerCase().includes(lowercaseQuery) || 
    n.content.toLowerCase().includes(lowercaseQuery) ||
    (n.category && n.category.toLowerCase().includes(lowercaseQuery))
  );
  
  return { passwords, notes };
};