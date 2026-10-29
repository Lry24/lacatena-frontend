'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Fait apparaître son contenu en douceur quand il entre à l'écran (une seule fois). */
export default function Reveal({ children, delay = 0, y = 28, className = '', style }: {
  children: ReactNode; delay?: number; y?: number; className?: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? 'is-shown' : ''} ${className}`}
      style={{ ...style, transitionDelay: shown ? `${delay}ms` : '0ms', ['--reveal-y' as string]: `${y}px` }}>
      {children}
    </div>
  );
}
