'use client';

import { useMemo } from 'react';

export interface PasswordStrength {
  score: number;       // 0-4
  label: string;       // Weak, Fair, Good, Strong
  color: string;       // Tailwind color class
  bgColor: string;     // Background color class
  percent: number;     // 0-100
}

function calculateStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', color: '', bgColor: 'bg-muted', percent: 0 };

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Normalize to 0-4 scale
  if (score <= 1) return { score: 1, label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-500', percent: 25 };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'text-amber-500', bgColor: 'bg-amber-500', percent: 50 };
  if (score <= 3) return { score: 3, label: 'Good', color: 'text-emerald-500', bgColor: 'bg-emerald-500', percent: 75 };
  return { score: 4, label: 'Strong', color: 'text-primary', bgColor: 'bg-primary', percent: 100 };
}

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => calculateStrength(password), [password]);
}

export default function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Strength bar */}
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.bgColor}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
      {/* Label */}
      <p className={`text-xs font-medium ${strength.color}`}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
