'use client';

import { useRef } from 'react';

interface OtpInputFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  length?: number;
}

export default function OtpInputField({
  value,
  onChange,
  disabled,
  length = 6,
}: OtpInputFieldProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (digit.length > 1) {
      const pasted = digit.replace(/\D/g, '').slice(0, length - index);
      const newValue = value.padEnd(length, ' ').split('');
      for (let i = 0; i < pasted.length; i++) {
        newValue[index + i] = pasted[i];
      }
      onChange(newValue.join('').replace(/\s/g, ''));
      inputRefs.current[Math.min(index + pasted.length, length - 1)]?.focus();
      return;
    }

    const newValue = value.padEnd(length, ' ').split('');
    newValue[index] = digit;
    onChange(newValue.slice(0, length).join('').replace(/\s/g, ''));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = value.padEnd(length, ' ').split('');
        newValue[index - 1] = '';
        onChange(newValue.join('').replace(/\s/g, ''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = value.padEnd(length, ' ').split('');
        newValue[index] = '';
        onChange(newValue.join('').replace(/\s/g, ''));
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-10 h-11 text-center text-lg font-bold bg-secondary/50 border border-border rounded-lg focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          aria-label={`Digit ${i + 1} of OTP`}
        />
      ))}
    </div>
  );
}
