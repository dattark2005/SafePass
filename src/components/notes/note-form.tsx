import React, { useState } from 'react';
import { Note } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface NoteFormProps {
  initialData?: Note;
  onSubmit: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function NoteForm({ initialData, onSubmit, onCancel }: NoteFormProps) {
  const [formData, setFormData] = useState<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Note Title"
        error={errors.title}
        required
      />
      
      <Input
        label="Category (optional)"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="e.g., Personal, Work, Recipes"
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Content
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your note here..."
          rows={8}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Note' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
}