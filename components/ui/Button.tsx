'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-xs tracking-widest',
    md: 'px-6 py-3 text-xs tracking-widest',
    lg: 'px-8 py-4 text-sm tracking-widest',
  };

  const variants: Record<string, string> = {
    primary:
      'bg-[#E8B96A] text-[#2D3A0F] hover:bg-[#f5cb85] active:scale-[0.98] uppercase',
    secondary:
      'border border-[#E8B96A] text-[#E8B96A] hover:bg-[rgba(232,185,106,0.08)] active:scale-[0.98] uppercase',
    ghost:
      'text-[rgba(240,234,210,0.55)] hover:text-[#F0EAD2] uppercase',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
