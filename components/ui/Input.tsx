'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 text-sm font-sans text-[#F0EAD2] outline-none transition-all duration-200 ${className}`}
        style={{
          background: 'rgba(240,234,210,0.05)',
          border: error ? '0.5px solid rgba(220,100,100,0.6)' : '0.5px solid rgba(240,234,210,0.1)',
          borderRadius: 4,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'rgba(220,100,100,0.6)'
            : 'rgba(240,234,210,0.1)';
        }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: 'rgba(220,100,100,0.9)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
