import React from 'react';
import { PasswordStrength as StrengthType } from '../../types';

interface PasswordStrengthProps {
  strength: StrengthType;
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthProps) {
  const getColorClass = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      case 'very-strong': return 'bg-indigo-500';
      default: return 'bg-gray-300';
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return '';
    }
  };

  const getWidth = () => {
    switch (strength) {
      case 'weak': return 'w-1/4';
      case 'medium': return 'w-2/4';
      case 'strong': return 'w-3/4';
      case 'very-strong': return 'w-full';
      default: return 'w-0';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Password strength:</span>
        <span className={`font-medium ${
          strength === 'weak' ? 'text-red-500' : 
          strength === 'medium' ? 'text-yellow-500' : 
          strength === 'strong' ? 'text-green-500' : 
          'text-indigo-500'
        }`}>
          {getLabel()}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColorClass()} ${getWidth()} transition-all duration-300 ease-in-out`}
        />
      </div>
    </div>
  );
}