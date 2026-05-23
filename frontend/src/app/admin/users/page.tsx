'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminUser } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.users().then(r => setUsers(r.results)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Utilisateurs</h4>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>{users.length} utilisateur(s)</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div className="p-3 border-bottom">
          <input className="form-control form-control-sm" style={{ maxWidth: 280 }}
            placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th className="ps-4">Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: u.is_staff ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: u.is_staff ? '#fff' : '#64748b', fontWeight: 700, fontSize: 13,
                        }}>
                          {u.username[0]?.toUpperCase()}
                        </div>
                        <span className="fw-semibold">{u.username}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{u.email || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                        background: u.is_staff ? '#eef2ff' : '#f8fafc',
                        color: u.is_staff ? '#6366f1' : '#94a3b8',
                      }}>
                        {u.is_staff ? '★ Admin' : 'Client'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                        background: u.is_active ? '#ecfdf5' : '#fef2f2',
                        color: u.is_active ? '#10b981' : '#ef4444',
                      }}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(u.date_joined).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-muted py-4" style={{ fontSize: 14 }}>Aucun utilisateur trouvé.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
