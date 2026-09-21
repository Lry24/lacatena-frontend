'use client';
/**
 * Composant Button — La Catena UI
 *
 * Remplace tous les <button style={{...}}> manuels du projet.
 *
 * Usage :
 * ─────────────────────────────────────────────────────────────────
 * import Button from '@/components/ui/Button';
 *
 * // Bouton principal doré (CTA)
 * <Button onClick={handleSubmit}>Ajouter au panier</Button>
 *
 * // Bouton contour (secondaire)
 * <Button variant="secondary" size="sm">Voir les détails</Button>
 *
 * // Bouton fantôme / texte (tertiaire)
 * <Button variant="ghost">Annuler</Button>
 *
 * // Pleine largeur + taille large + désactivé
 * <Button fullWidth size="lg" disabled={loading}>
 *   {loading ? 'Chargement...' : 'Confirmer la commande'}
 * </Button>
 *
 * Props :
 *   variant   → 'primary' (défaut) | 'secondary' | 'ghost'
 *   size      → 'sm' | 'md' (défaut) | 'lg'
 *   fullWidth → boolean (défaut false)
 *   + tous les attributs HTML natifs d'un <button>
 * ─────────────────────────────────────────────────────────────────
 */
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
    'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-sm';

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-[10px] tracking-[2px]',
    md: 'px-6 py-3 text-[10px] tracking-[2px]',
    lg: 'px-8 py-4 text-[11px] tracking-[2.5px]',
  };

  const variants: Record<string, string> = {
    primary:
      'bg-[#E8B96A] text-[#2D3A0F] hover:bg-[#f5cb85] active:scale-[0.97] uppercase',
    secondary:
      'border border-[rgba(232,185,106,0.4)] text-[#E8B96A] hover:bg-[rgba(232,185,106,0.08)] active:scale-[0.97] uppercase',
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
