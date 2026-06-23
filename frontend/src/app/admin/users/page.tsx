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
    <div className="users-page">
      <style jsx>{`
        .users-page { color: #f4f4f4; }
        .users-header { margin-bottom: 20px; }
        .users-eyebrow { margin: 0 0 6px; color: #909090; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        h1 { margin: 0; color: #fff; font-size: 27px; font-weight: 750; letter-spacing: -.035em; }
        .users-count { margin: 6px 0 0; color: #999; font-size: 12px; }
        .users-panel { overflow: hidden; border: 1px solid #343434; border-radius: 9px; background: #202020; }
        .users-toolbar { display: flex; align-items: center; padding: 13px 14px; border-bottom: 1px solid #343434; }
        .search-wrap { position: relative; width: min(100%, 300px); }
        .search-icon { position: absolute; top: 50%; left: 11px; color: #929292; font-size: 12px; pointer-events: none; transform: translateY(-50%); }
        .search-input { width: 100%; border: 1px solid #494949; border-radius: 7px; outline: none; background: #171717; color: #f4f4f4; padding: 8px 10px 8px 31px; font-size: 12px; }
        .search-input::placeholder { color: #858585; }
        .search-input:focus { border-color: #8a8a8a; box-shadow: 0 0 0 3px rgba(255,255,255,.08); }
        .users-table-wrap { overflow-x: auto; }
        .users-table { width: 100%; min-width: 690px; border-collapse: collapse; font-size: 12px; }
        .users-table th { padding: 12px 16px; border-bottom: 1px solid #343434; color: #858585; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
        .users-table td { padding: 13px 16px; border-bottom: 1px solid #2e2e2e; color: #c9c9c9; vertical-align: middle; }
        .users-table tbody tr:hover { background: #252525; }
        .users-table tr:last-child td { border-bottom: 0; }
        .user-cell { display: flex; align-items: center; gap: 10px; color: #f0f0f0; font-weight: 650; }
        .user-avatar { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border: 1px solid #4c4c4c; border-radius: 50%; background: #303030; color: #fff; font-size: 12px; font-weight: 800; }
        .user-avatar.staff { border-color: #6a6a6a; background: #e7e7e7; color: #171717; }
        .email, .joined { color: #a4a4a4; }
        .joined { white-space: nowrap; }
        .badge { display: inline-flex; border: 1px solid #4a4a4a; border-radius: 999px; background: #292929; color: #c9c9c9; padding: 4px 8px; font-size: 10px; font-weight: 700; white-space: nowrap; }
        .badge.emphasis { border-color: #6c6c6c; background: #e7e7e7; color: #171717; }
        .badge.active { border-color: #666; background: #303030; color: #f0f0f0; }
        .loading { display: grid; min-height: 220px; place-items: center; }
        .spinner { width: 28px; height: 28px; border: 3px solid #444; border-top-color: #fff; border-radius: 50%; animation: users-spin .75s linear infinite; }
        .empty { padding: 42px 16px; color: #929292; font-size: 13px; text-align: center; }
        @keyframes users-spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { h1 { font-size: 25px; } }
      `}</style>

      <header className="users-header">
        <p className="users-eyebrow">Comptes</p>
        <h1>Utilisateurs</h1>
        <p className="users-count">{users.length} utilisateur(s)</p>
      </header>

      <section className="users-panel">
        <div className="users-toolbar">
          <div className="search-wrap">
            <i className="fas fa-search search-icon" />
            <input className="search-input" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscrit le</th></tr></thead>
              <tbody>{filtered.map(u => (
                <tr key={u.id}>
                  <td><div className="user-cell"><span className={`user-avatar${u.is_staff ? ' staff' : ''}`}>{u.username[0]?.toUpperCase()}</span>{u.username}</div></td>
                  <td className="email">{u.email || '—'}</td>
                  <td><span className={`badge${u.is_staff ? ' emphasis' : ''}`}>{u.is_staff ? 'Admin' : 'Client'}</span></td>
                  <td><span className={`badge${u.is_active ? ' active' : ''}`}>{u.is_active ? 'Actif' : 'Inactif'}</span></td>
                  <td className="joined">{new Date(u.date_joined).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}</tbody>
            </table>
            {filtered.length === 0 && <div className="empty">Aucun utilisateur trouvé.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
