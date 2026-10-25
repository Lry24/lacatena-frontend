'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { api } from '@/lib/api';

/** Couleurs de l'administration : la palette La Catena, plus dense et plus contrastée pour le travail quotidien. */
export const A = {
  bg: '#141a0b',
  surface: '#1e2614',
  surface2: '#252e16',
  border: 'rgba(255,255,255,0.10)',
  text: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.58)',
  faint: 'rgba(255,255,255,0.35)',
  gold: '#E8B96A',
  goldBg: 'rgba(232,185,106,0.12)',
  olive: '#4A6020',
  red: '#E8A08A',
  green: '#A9C77A',
};

const TONES: Record<string, { fg: string; bg: string }> = {
  gold: { fg: A.gold, bg: A.goldBg },
  olive: { fg: '#C9DB9E', bg: 'rgba(74,96,32,0.45)' },
  cream: { fg: '#F0EAD2', bg: 'rgba(240,234,210,0.10)' },
  red: { fg: A.red, bg: 'rgba(232,160,138,0.12)' },
  green: { fg: A.green, bg: 'rgba(169,199,122,0.14)' },
};

export function Badge({ children, tone = 'cream' }: { children: ReactNode; tone?: string }) {
  const t = TONES[tone] || TONES.cream;
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '3px 10px', borderRadius: 20, color: t.fg, background: t.bg, whiteSpace: 'nowrap', fontWeight: 500 }}>{children}</span>;
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-serif" style={{ fontSize: 30, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: A.muted, marginTop: 6 }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, title, action, style, pad = 20 }: { children: ReactNode; title?: string; action?: ReactNode; style?: CSSProperties; pad?: number }) {
  return (
    <section style={{ background: A.surface, border: `1px solid ${A.border}`, borderRadius: 10, padding: pad, ...style }}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && <h2 style={{ fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase', color: A.muted, fontWeight: 500 }}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone, href }: { label: string; value: ReactNode; hint?: string; tone?: 'gold' | 'red'; href?: string }) {
  const body = (
    <div style={{ background: A.surface, border: `1px solid ${tone === 'red' ? 'rgba(232,160,138,0.35)' : A.border}`, borderRadius: 10, padding: '18px 20px', height: '100%' }}>
      <p style={{ fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: A.muted }}>{label}</p>
      <p className="font-serif" style={{ fontSize: 28, color: tone === 'red' ? A.red : tone === 'gold' ? A.gold : '#fff', marginTop: 8, lineHeight: 1.1 }}>{value}</p>
      {hint && <p style={{ fontSize: 12, color: A.faint, marginTop: 6 }}>{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block transition-transform hover:-translate-y-0.5">{body}</Link> : body;
}

type BtnVariant = 'gold' | 'ghost' | 'danger' | 'subtle';
export function Btn({ children, onClick, href, type = 'button', variant = 'gold', disabled, small, style }: {
  children: ReactNode; onClick?: () => void; href?: string; type?: 'button' | 'submit'; variant?: BtnVariant; disabled?: boolean; small?: boolean; style?: CSSProperties;
}) {
  const looks: Record<BtnVariant, CSSProperties> = {
    gold: { background: A.gold, color: '#2D3A0F', border: '1px solid transparent' },
    ghost: { background: 'transparent', color: A.text, border: `1px solid ${A.border}` },
    subtle: { background: A.surface2, color: A.text, border: `1px solid ${A.border}` },
    danger: { background: 'transparent', color: A.red, border: '1px solid rgba(232,160,138,0.4)' },
  };
  const s: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 7, fontWeight: 500,
    fontSize: small ? 12 : 13, padding: small ? '6px 12px' : '9px 16px', whiteSpace: 'nowrap',
    opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'filter .15s, background .15s', ...looks[variant], ...style,
  };
  if (href) return <Link href={href} style={s} className="hover:brightness-110">{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} style={s} className="hover:brightness-110">{children}</button>;
}

export const fieldStyle: CSSProperties = {
  width: '100%', background: A.bg, border: `1px solid ${A.border}`, borderRadius: 7, color: A.text, fontSize: 13, padding: '9px 12px', outline: 'none',
};

export function AField({ label, children, hint, full }: { label: string; children: ReactNode; hint?: string; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <span style={{ fontSize: 12, color: A.muted }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: A.faint }}>{hint}</span>}
    </label>
  );
}

export function AInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="admin-input" style={{ ...fieldStyle, ...props.style }} />;
}

export function ASelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="admin-input" style={{ ...fieldStyle, ...props.style }} />;
}

export function ATextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="admin-input" style={{ ...fieldStyle, minHeight: 90, resize: 'vertical', ...props.style }} />;
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string | false }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: A.faint, fontWeight: 500, borderBottom: `1px solid ${A.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <p style={{ textAlign: 'center', padding: '40px 0', color: A.faint, fontSize: 13 }}>{empty}</p>}
    </div>
  );
}

export const td: CSSProperties = { padding: '12px', borderBottom: `1px solid rgba(255,255,255,0.06)`, color: A.text, verticalAlign: 'middle' };

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (pages <= 1) return <p style={{ fontSize: 12, color: A.faint, marginTop: 12 }}>{total} résultat{total > 1 ? 's' : ''}</p>;
  return (
    <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
      <p style={{ fontSize: 12, color: A.faint }}>{total} résultats · page {page} / {pages}</p>
      <div className="flex gap-2">
        <Btn small variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Précédente</Btn>
        <Btn small variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Suivante →</Btn>
      </div>
    </div>
  );
}

export function Modal({ title, children, onClose, width = 520 }: { title: string; children: ReactNode; onClose: () => void; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div className="relative w-full overflow-y-auto" style={{ maxWidth: width, maxHeight: '90vh', background: A.surface, border: `1px solid ${A.border}`, borderRadius: 12, padding: 24 }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-serif" style={{ fontSize: 22, color: '#fff' }}>{title}</h2>
          <button onClick={onClose} aria-label="Fermer" style={{ color: A.muted, fontSize: 18 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Alert({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'gold' }) {
  return (
    <div role="alert" style={{ fontSize: 13, padding: '10px 14px', borderRadius: 7, lineHeight: 1.5, color: tone === 'red' ? A.red : A.gold, background: tone === 'red' ? 'rgba(232,160,138,0.1)' : A.goldBg, border: `1px solid ${tone === 'red' ? 'rgba(232,160,138,0.3)' : 'rgba(232,185,106,0.3)'}` }}>
      {children}
    </div>
  );
}

export function Spin() {
  return (
    <div className="flex justify-center" style={{ padding: '48px 0' }}>
      <span className="spin-ring inline-block" style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid rgba(232,185,106,0.25)', borderTopColor: A.gold }} />
    </div>
  );
}

/** Chargement d'une ressource admin avec rechargement manuel. */
export function useFetch<T>(path: string | null, query?: Record<string, string | number | boolean | null | undefined>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const key = JSON.stringify(query || {});
  const load = useCallback(() => {
    if (!path) return;
    api<T>(path, { query: JSON.parse(key) }).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message));
  }, [path, key]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load, setData };
}
