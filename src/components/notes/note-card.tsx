import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { Note } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden hover:border-indigo-300 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{note.title}</CardTitle>
          {note.category && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              {note.category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-line">{note.content}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Updated {formatDate(note.updatedAt)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(note)}
          className="text-gray-600 hover:text-indigo-600"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(note.id)}
          className="text-gray-600 hover:text-red-600"
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}