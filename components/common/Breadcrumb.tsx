'use client';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <span style={{ color: 'var(--cream-muted)', fontSize: 10 }}>›</span>
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-xs hover:text-[#E8B96A] transition-colors duration-150"
              style={{ color: 'var(--cream-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-xs"
              style={{ color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
