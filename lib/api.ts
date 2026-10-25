export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

function qs(params?: Query): string {
  if (!params) return '';
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== false) s.set(k, String(v));
  }
  const out = s.toString();
  return out ? `?${out}` : '';
}

/** Jeton admin lu à chaque appel (le store le met à jour). */
let tokenGetter: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
export function configureAuth(getter: () => string | null, unauthorized: () => void) {
  tokenGetter = getter;
  onUnauthorized = unauthorized;
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; query?: Query; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = path.startsWith('/api/v1/admin') ? tokenGetter() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${qs(opts.query)}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Connexion impossible. Vérifiez votre réseau puis réessayez.', 0);
  }
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) {
    let message = 'Une erreur est survenue. Réessayez dans un instant.';
    try {
      const data = await res.json();
      if (typeof data.detail === 'string') message = data.detail;
    } catch { /* réponse non JSON */ }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Adresse affichable d'une image : les photos envoyées depuis l'admin sont servies par l'API. */
export function imageUrl(url: string | null | undefined): string {
  if (!url) return '/images/noBack.png';
  return url.startsWith('/api/') ? `${API_URL}${url}` : url;
}

export const invoiceUrl = (number: string, phone: string) =>
  `${API_URL}/api/v1/orders/${encodeURIComponent(number)}/invoice${qs({ phone })}`;
