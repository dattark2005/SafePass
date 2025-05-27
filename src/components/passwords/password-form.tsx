import React, { useState, useEffect } from 'react';
import { RefreshCw as Refresh } from 'lucide-react';
import { Password } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PasswordStrengthIndicator } from '../ui/password-strength';
import { generatePassword, getPasswordStrength } from '../../utils/password-generator';

interface PasswordFormProps {
  initialData?: Password;
  onSubmit: (data: Omit<Password, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PasswordForm({ initialData, onSubmit, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState<Omit<Password, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    website: initialData?.website || '',
    category: initialData?.category || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(() => 
    getPasswordStrength(formData.password)
  );

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16, true, true, true, true);
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username/Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
        placeholder="e.g., Gmail Account"
        error={errors.title}
        required
      />
      
      <Input
        label="Username/Email"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="username@example.com"
        error={errors.username}
        required
      />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            label="Password"
            name="password"
            type="text"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            error={errors.password}
            className="flex-1"
            required
          />
          <Button
            type="button"
            variant="outline"
            className="mt-7"
            onClick={handleGeneratePassword}
          >
            <Refresh className="h-4 w-4 mr-1" />
            Generate
          </Button>
        </div>
        <PasswordStrengthIndicator strength={passwordStrength} />
      </div>
      
      <Input
        label="Website (optional)"
        name="website"
        value={formData.website}
        onChange={handleChange}
        placeholder="example.com"
      />
      
      <Input
        label="Category (optional)"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="e.g., Work, Personal, Finance"
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any additional information here..."
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
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
          {initialData ? 'Update Password' : 'Save Password'}
        </Button>
      </div>
    </form>
  );
}