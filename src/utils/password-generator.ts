export const generatePassword = (
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true
): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let availableChars = '';
  if (includeUppercase) availableChars += uppercaseChars;
  if (includeLowercase) availableChars += lowercaseChars;
  if (includeNumbers) availableChars += numberChars;
  if (includeSymbols) availableChars += symbolChars;

  // Fallback to ensure we have characters to choose from
  if (!availableChars) {
    availableChars = lowercaseChars + numberChars;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    password += availableChars[randomIndex];
  }

  return password;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | 'very-strong' => {
  if (!password) return 'weak';
  
  // Calculate score based on various factors
  let score = 0;
  
  // Length factor
  if (password.length >= 12) score += 3;
  else if (password.length >= 8) score += 2;
  else if (password.length >= 6) score += 1;
  
  // Character variety factors
  if (/[A-Z]/.test(password)) score += 1; // Has uppercase
  if (/[a-z]/.test(password)) score += 1; // Has lowercase
  if (/[0-9]/.test(password)) score += 1; // Has numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has symbols
  
  // Determine strength based on score
  if (score >= 6) return 'very-strong';
  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
};