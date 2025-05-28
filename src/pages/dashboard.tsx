import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Lock, FileText } from "lucide-react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Button } from "../components/ui/button";
import { SearchBar } from "../components/ui/searchbar";
import { Modal } from "../components/ui/modal";
import { PasswordCard } from "../components/passwords/password-card";
import { PasswordForm } from "../components/passwords/password-form";
import NoteCard from "../components/notes/note-card";
import { NoteForm } from "../components/notes/note-form";
import { Password, Note } from "../types";

type TabType = "all" | "passwords" | "notes";

export function DashboardPage() {
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState<Password[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | undefined>(
    undefined
  );
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    type: "password" | "note";
    id: string;
  }>({ open: false, type: "password", id: "" });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch passwords and notes from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notesUnsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/notes`),
      (snapshot) => {
        const notesData: Note[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: user.uid,
          title: doc.data().title,
          content: doc.data().content,
          category: doc.data().category,
          createdAt: (doc.data().createdAt as Timestamp).toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
        }));
        setNotes(notesData);
      },
      () => setError("Unable to fetch notes. Please try again.")
    );

    const passwordsUnsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/passwords`),
      (snapshot) => {
        const passwordsData: Password[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: user.uid,
          title: doc.data().title,
          username: doc.data().username,
          password: doc.data().password,
          url: doc.data().url,
          category: doc.data().category,
          notes: doc.data().notes,
          createdAt: (doc.data().createdAt as Timestamp).toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
        }));
        setPasswords(passwordsData);
      },
      () => setError("Unable to fetch passwords. Please try again.")
    );

    return () => {
      notesUnsubscribe();
      passwordsUnsubscribe();
    };
  }, []);

  // Filter items based on search query and active tab
  const filteredItems = () => {
    let filteredPasswords = passwords;
    let filteredNotes = notes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPasswords = passwords.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
      filteredNotes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          (n.category && n.category.toLowerCase().includes(query))
      );
    }

    if (activeTab === "all") {
      return { passwords: filteredPasswords, notes: filteredNotes };
    }
    if (activeTab === "passwords") {
      return { passwords: filteredPasswords, notes: [] };
    }
    return { passwords: [], notes: filteredNotes };
  };

  // Password handlers
  const handleAddPassword = () => {
    setEditingPassword(undefined);
    setIsPasswordModalOpen(true);
  };

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setIsPasswordModalOpen(true);
  };

  const handleDeletePassword = (id: string) => {
    setDeleteConfirmModal({
      open: true,
      type: "password",
      id,
    });
  };

  const confirmDeletePassword = async () => {
    const { id } = deleteConfirmModal;
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to delete passwords.");
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${user.uid}/passwords`, id));
      setDeleteConfirmModal({ open: false, type: "password", id: "" });
      setError("");
    } catch {
      setError("Unable to delete password. Please try again.");
    }
  };

  const handlePasswordSubmit = async (
    data: Omit<Password, "id" | "createdAt" | "updatedAt">
  ) => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to save passwords.");
      return;
    }
    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === undefined ? null : value,
        ])
      );

      const passwordData = {
        ...sanitizedData,
        userId: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (editingPassword) {
        await updateDoc(
          doc(db, `users/${user.uid}/passwords`, editingPassword.id),
          passwordData
        );
      } else {
        await addDoc(
          collection(db, `users/${user.uid}/passwords`),
          passwordData
        );
      }

      setError("");
      setIsPasswordModalOpen(false);
      setEditingPassword(undefined);
    } catch {
      setError("Unable to save password. Please try again.");
    }
  };

  // Note handlers
  const handleAddNote = () => {
    setEditingNote(undefined);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setDeleteConfirmModal({
      open: true,
      type: "note",
      id,
    });
  };

  const confirmDeleteNote = async () => {
    const { id } = deleteConfirmModal;
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to delete notes.");
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
      setDeleteConfirmModal({ open: false, type: "note", id: "" });
      setError("");
    } catch {
      setError("Unable to delete note. Please try again.");
    }
  };

  const handleNoteSubmit = async (
    data: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to save notes.");
      return;
    }
    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === undefined ? null : value,
        ])
      );

      const noteData = {
        ...sanitizedData,
        userId: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (editingNote) {
        await updateDoc(
          doc(db, `users/${user.uid}/notes`, editingNote.id),
          noteData
        );
      } else {
        await addDoc(collection(db, `users/${user.uid}/notes`), noteData);
      }

      setError("");
      setIsNoteModalOpen(false);
      setEditingNote(undefined);
    } catch {
      setError("Unable to save note. Please try again.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const { passwords: filteredPasswords, notes: filteredNotes } =
    filteredItems();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Vault</h1>
        <p className="text-gray-600">
          Securely store and manage your passwords and notes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Items
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "passwords"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("passwords")}
          >
            Passwords
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar onSearch={handleSearch} />
          <div className="flex gap-2">
            <Button
              onClick={handleAddPassword}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </Button>
            <Button
              onClick={handleAddNote}
              variant="outline"
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Note</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {filteredPasswords.length === 0 && filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No items found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery
              ? "No items match your search. Try a different search term."
              : "Start by adding a password or note to your vault."}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleAddPassword}>
              <Plus className="h-4 w-4 mr-1" />
              Add Password
            </Button>
            <Button onClick={handleAddNote} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPasswords.map((password) => (
            <PasswordCard
              key={password.id}
              password={password}
              onEdit={handleEditPassword}
              onDelete={handleDeletePassword}
            />
          ))}
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={editingPassword ? "Edit Password" : "Add New Password"}
        size="lg"
      >
        <PasswordForm
          initialData={editingPassword}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setIsPasswordModalOpen(false)}
        />
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? "Edit Note" : "Add New Note"}
        size="lg"
      >
        <NoteForm
          initialData={editingNote}
          onSubmit={handleNoteSubmit}
          onCancel={() => setIsNoteModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModal.open}
        onClose={() =>
          setDeleteConfirmModal({ ...deleteConfirmModal, open: false })
        }
        title={`Delete ${
          deleteConfirmModal.type === "password" ? "Password" : "Note"
        }`}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmModal({ ...deleteConfirmModal, open: false })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteConfirmModal.type === "password"
                  ? confirmDeletePassword
                  : confirmDeleteNote
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this {deleteConfirmModal.type}? This
          action cannot be undone.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
