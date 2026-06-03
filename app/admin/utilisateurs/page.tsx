'use client';
import React, { useEffect, useState, useCallback } from 'react';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface AdminUser {
  uuid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
}

const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('fr-FR') : '—';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,234,210,0.1)',
  borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none',
};

const defaultUserForm = () => ({ first_name: '', last_name: '', email: '', password: '', role: 'staff' });

export default function UtilisateursPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState(defaultUserForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.listUsers({ page, size: 20, q: search || undefined, role: roleFilter || undefined })
      .then((r) => { setUsers(r.items ?? r); setTotal(r.total ?? r.length); })
      .catch(() => showToast('Erreur chargement utilisateurs.', 'error'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreateUser = async () => {
    if (!form.first_name || !form.email || !form.password) { showToast('Prénom, e-mail et mot de passe requis.', 'warning'); return; }
    setSaving(true);
    try {
      await adminApi.createUser({ ...form });
      showToast('Utilisateur créé.', 'success');
      setCreateModal(false);
      setForm(defaultUserForm());
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      showToast(e?.response?.data?.detail || 'Erreur création utilisateur.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (uuid: string, is_active: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminApi.updateUser(uuid, { is_active: !is_active });
      setUsers((prev) => prev.map((u) => u.uuid === uuid ? { ...u, is_active: !u.is_active } : u));
      showToast('Statut mis à jour.', 'success');
    } catch {
      showToast('Erreur.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteUser(deleting.uuid);
      setUsers((prev) => prev.filter((u) => u.uuid !== deleting.uuid));
      showToast('Utilisateur supprimé.', 'success');
      setDeleting(null);
    } catch {
      showToast('Erreur suppression.', 'error');
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name', label: 'Nom',
      render: (r) => <span style={{ fontWeight: 500, color: '#f0ead2' }}>{r.full_name}</span>,
    },
    { key: 'email', label: 'E-mail', render: (r) => <span style={{ color: 'rgba(240,234,210,0.7)', fontSize: 12 }}>{r.email}</span> },
    { key: 'role', label: 'Rôle', render: (r) => <StatusBadge status={r.role} /> },
    { key: 'is_active', label: 'Actif', render: (r) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
    { key: 'last_login', label: 'Dernière connexion', render: (r) => <span style={{ color: 'rgba(240,234,210,0.4)', fontSize: 12 }}>{fmtDate(r.last_login)}</span> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={(e) => handleToggle(r.uuid, r.is_active, e)}
            style={{ padding: '5px 9px', background: r.is_active ? 'rgba(201,99,74,0.1)' : 'rgba(111,170,48,0.1)', border: `1px solid ${r.is_active ? 'rgba(201,99,74,0.2)' : 'rgba(111,170,48,0.2)'}`, borderRadius: 5, color: r.is_active ? '#c9634a' : '#6faa30', cursor: 'pointer', fontSize: 11 }}>
            {r.is_active ? 'Désactiver' : 'Activer'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleting(r); }}
            style={{ padding: '5px 9px', background: 'rgba(201,99,74,0.1)', border: '1px solid rgba(201,99,74,0.2)', borderRadius: 5, color: '#c9634a', cursor: 'pointer', fontSize: 11 }}>
            Suppr.
          </button>
        </div>
      ),
    },
  ];

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0ead2', margin: 0 }}>Utilisateurs</h1>
        <button onClick={() => setCreateModal(true)}
          style={{ padding: '9px 18px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1a1f0e', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          + Nouvel utilisateur
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(q); setPage(1); } }}
          placeholder="Rechercher…"
          style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none', width: 220 }}
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none' }}>
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, overflow: 'hidden' }}>
        <AdminTable columns={columns} data={users} loading={loading} emptyMessage="Aucun utilisateur trouvé." />
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 14px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, color: '#f0ead2', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>
            ← Précédent
          </button>
          <span style={{ padding: '7px 14px', color: 'rgba(240,234,210,0.5)', fontSize: 13 }}>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '7px 14px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, color: '#f0ead2', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1, fontSize: 13 }}>
            Suivant →
          </button>
        </div>
      )}

      {/* Create modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Nouvel utilisateur" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(240,234,210,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Prénom *</label>
              <input value={form.first_name} onChange={set('first_name')} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(240,234,210,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Nom</label>
              <input value={form.last_name} onChange={set('last_name')} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(240,234,210,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>E-mail *</label>
            <input type="email" value={form.email} onChange={set('email')} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(240,234,210,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Mot de passe *</label>
            <input type="password" value={form.password} onChange={set('password')} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(240,234,210,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Rôle</label>
            <select value={form.role} onChange={set('role')} style={inputStyle}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => setCreateModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: 'rgba(240,234,210,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleCreateUser} disabled={saving} style={{ flex: 1, padding: '10px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1a1f0e', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Supprimer l'utilisateur" width={400}>
        <p style={{ color: 'rgba(240,234,210,0.7)', fontSize: 13, marginBottom: 20 }}>
          Êtes-vous sûr de vouloir supprimer <strong style={{ color: '#f0ead2' }}>{deleting?.full_name}</strong> ?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: 'rgba(240,234,210,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#c9634a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}
