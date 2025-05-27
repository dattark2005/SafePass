import React, { useState } from 'react';
import { Eye, EyeOff, Edit, Trash, Globe } from 'lucide-react';
import { Password } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

interface PasswordCardProps {
  password: Password;
  onEdit: (password: Password) => void;
  onDelete: (id: string) => void;
}

export function PasswordCard({ password, onEdit, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const maskedPassword = password.password.replace(/./g, '•');

  const handleOpenWebsite = () => {
    if (password.website) {
      let url = password.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden hover:border-indigo-300 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{password.title}</CardTitle>
          {password.category && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              {password.category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-500">Username/Email</p>
          <p className="text-sm">{password.username}</p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Password</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="font-mono text-sm">{showPassword ? password.password : maskedPassword}</p>
        </div>
        {password.website && (
          <div>
            <p className="text-sm font-medium text-gray-500">Website</p>
            <button
              onClick={handleOpenWebsite}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              {password.website}
            </button>
          </div>
        )}
        {password.notes && (
          <div>
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="text-sm">{password.notes}</p>
          </div>
        )}
        <p className="text-xs text-gray-400">
          Updated {formatDate(password.updatedAt)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(password)}
          className="text-gray-600 hover:text-indigo-600"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(password.id)}
          className="text-gray-600 hover:text-red-600"
        >
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}