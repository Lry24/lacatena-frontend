'use client';
import Link from 'next/link';
import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { create } from 'zustand';

/** Vrai après le premier rendu côté navigateur (évite les écarts avec le rendu serveur pour le panier, etc.). */
const noop = () => () => {};
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export const label: CSSProperties = { fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' };

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8 md:mb-12">
      <p style={{ ...label, whiteSpace: 'nowrap' }}>{children}</p>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
      {action}
    </div>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-10 md:mb-12">
      {eyebrow && <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>{eyebrow}</p>}
      <h1 className="font-serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{title}</h1>
      {children && <div style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginTop: 12, maxWidth: 560 }}>{children}</div>}
    </div>
  );
}

const btnBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, borderRadius: 2,
  padding: '14px 28px', cursor: 'pointer', whiteSpace: 'nowrap',
};

type BtnProps = {
  children: ReactNode; href?: string; onClick?: () => void; type?: 'button' | 'submit';
  disabled?: boolean; full?: boolean; variant?: 'gold' | 'outline' | 'ghost'; style?: CSSProperties;
};

export function Button({ children, href, onClick, type = 'button', disabled, full, variant = 'gold', style }: BtnProps) {
  const look: CSSProperties =
    variant === 'gold'
      ? { background: disabled ? 'rgba(232,185,106,0.2)' : 'var(--gold)', color: disabled ? 'rgba(232,185,106,0.5)' : '#2D3A0F', border: 'none' }
      : variant === 'outline'
        ? { background: 'transparent', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.45)' }
        : { background: 'transparent', color: 'var(--cream-muted)', border: '0.5px solid var(--border)' };
  const s = { ...btnBase, ...look, width: full ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer', ...style };
  const cls = variant === 'gold' ? 'btn-gold hover:brightness-110' : 'btn-outline hover:border-[#E8B96A] hover:text-[#E8B96A]';
  if (href) return <Link href={href} className={cls} style={s}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} style={s}>{children}</button>;
}

export const inputStyle: CSSProperties = {
  width: '100%', background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.16)', borderRadius: 2,
  color: 'var(--cream)', fontSize: 14, padding: '13px 14px', outline: 'none', transition: 'border-color .2s',
};

export function Field({ label: text, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>{text}</span>
      {children}
      {error ? <span style={{ fontSize: 12, color: '#E8A08A' }}>{error}</span>
        : hint ? <span style={{ fontSize: 12, color: 'rgba(248,242,228,0.45)' }}>{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`lc-input ${props.className ?? ''}`} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="lc-input" style={{ ...inputStyle, resize: 'vertical', minHeight: 88, ...props.style }} />;
}

export function Spinner({ size = 28 }: { size?: number }) {
  return <span className="spin-ring inline-block" style={{ width: size, height: size, borderRadius: '50%', border: '1.5px solid rgba(232,185,106,0.25)', borderTopColor: 'var(--gold)' }} />;
}

export function Loading({ text = 'Chargement…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ padding: '80px 0', color: 'var(--cream-muted)', fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>
      <Spinner />
      {text}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: '64px 24px', border: '0.5px solid var(--border)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
      <span className="chain-divider" style={{ marginBottom: 20 }}>⊙⊙⊙⊙⊙⊙</span>
      <p className="font-serif" style={{ fontSize: 26, color: 'var(--cream)', marginBottom: 8 }}>{title}</p>
      {text && <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 420, marginBottom: 24 }}>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" style={{ border: '0.5px solid rgba(232,160,138,0.45)', background: 'rgba(232,160,138,0.08)', color: '#F0C2B4', padding: '12px 16px', borderRadius: 4, fontSize: 13, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

export function Price({ price, compare, size = 13 }: { price: number; compare?: number | null; size?: number }) {
  const f = (n: number) => `${n.toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span style={{ fontSize: size, fontWeight: 500, color: 'var(--gold)' }}>{f(price)}</span>
      {compare ? <span style={{ fontSize: size * 0.85, color: 'rgba(248,242,228,0.4)', textDecoration: 'line-through' }}>{f(compare)}</span> : null}
    </span>
  );
}

// ── Petites notifications ─────────────────────────────────

interface ToastState { message: string | null; tone: 'ok' | 'error'; show: (m: string, tone?: 'ok' | 'error') => void; }
export const useToast = create<ToastState>((set) => ({
  message: null,
  tone: 'ok',
  show: (message, tone = 'ok') => {
    set({ message, tone });
    setTimeout(() => set((s) => (s.message === message ? { message: null } : s)), 3000);
  },
}));

export function Toaster() {
  const { message, tone } = useToast();
  if (!message) return null;
  return (
    <div role="status" className="animate-fade-up fixed z-[200] left-1/2 -translate-x-1/2" style={{ bottom: 28, background: '#2D3A0F', border: `0.5px solid ${tone === 'ok' ? 'rgba(232,185,106,0.4)' : 'rgba(232,160,138,0.6)'}`, color: 'var(--cream)', padding: '14px 24px', fontSize: 13, borderRadius: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', maxWidth: 'calc(100vw - 32px)' }}>
      <span style={{ color: tone === 'ok' ? 'var(--gold)' : '#E8A08A', marginRight: 8 }}>{tone === 'ok' ? '✦' : '!'}</span>{message}
    </div>
  );
}
