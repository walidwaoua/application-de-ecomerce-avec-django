'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminStats, AdminOrder } from '@/lib/api';

const CARDS = (s: AdminStats) => [
  {
    label: 'Chiffre d\'affaires',
    value: `${s.revenue.toLocaleString('fr-FR')} DH`,
    sub: 'commandes payées',
    icon: 'fas fa-coins',
    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    glow: 'rgba(99,102,241,.25)',
  },
  {
    label: 'Commandes totales',
    value: s.total_orders,
    sub: `${s.pending_orders} en attente`,
    icon: 'fas fa-shopping-bag',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    glow: 'rgba(245,158,11,.25)',
  },
  {
    label: 'Produits',
    value: s.total_products,
    sub: 'dans le catalogue',
    icon: 'fas fa-box-open',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: 'rgba(16,185,129,.25)',
  },
  {
    label: 'Utilisateurs',
    value: s.total_users,
    sub: 'comptes inscrits',
    icon: 'fas fa-users',
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    glow: 'rgba(59,130,246,.25)',
  },
];

const STATUS = (o: AdminOrder) =>
  o.isDelivered ? { label: 'Livrée',     bg: '#ecfdf5', color: '#059669' } :
  o.isPaid       ? { label: 'Payée',      bg: '#eff6ff', color: '#2563eb' } :
  o.is_validated ? { label: 'Validée',    bg: '#fef9c3', color: '#b45309' } :
                   { label: 'En attente', bg: '#fef2f2', color: '#dc2626' };

export default function AdminDashboard() {
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.orders()])
      .then(([s, o]) => { setStats(s); setOrders(o.results.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
      <div className="text-center">
        <div className="spinner-border" style={{ color: '#6366f1', width: 40, height: 40 }} />
        <p className="mt-3 text-muted" style={{ fontSize: 14 }}>Chargement du tableau de bord...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-5">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: 26 }}>
            Tableau de bord
          </h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0, textTransform: 'capitalize' }}>
            <i className="fas fa-calendar-alt me-2" style={{ color: '#6366f1' }} />
            {today}
          </p>
        </div>
        <Link href="/admin/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
          color: '#fff', textDecoration: 'none',
          padding: '10px 20px', borderRadius: 10,
          fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(99,102,241,.35)',
        }}>
          <i className="fas fa-plus" />
          Nouveau produit
        </Link>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="row g-4 mb-5">
          {CARDS(stats).map(card => (
            <div className="col-sm-6 col-xl-3" key={card.label}>
              <div style={{
                background: '#fff', borderRadius: 16, padding: '24px',
                boxShadow: `0 4px 24px ${card.glow}`,
                border: '1px solid rgba(255,255,255,.8)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  background: card.gradient, opacity: .08,
                }} />
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: card.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${card.glow}`,
                  }}>
                    <i className={card.icon} style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4">
        {/* Recent orders */}
        <div className="col-xl-8">
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h6 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Commandes récentes</h6>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>6 dernières commandes</p>
              </div>
              <Link href="/admin/orders" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                Tout voir →
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-5 text-muted" style={{ fontSize: 14 }}>Aucune commande.</div>
            ) : (
              <table className="table mb-0" style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th className="ps-4 border-0 fw-semibold" style={{ color: '#94a3b8' }}>#</th>
                    <th className="border-0 fw-semibold" style={{ color: '#94a3b8' }}>CLIENT</th>
                    <th className="border-0 fw-semibold" style={{ color: '#94a3b8' }}>TOTAL</th>
                    <th className="border-0 fw-semibold" style={{ color: '#94a3b8' }}>DATE</th>
                    <th className="border-0 fw-semibold" style={{ color: '#94a3b8' }}>STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS(o);
                    return (
                      <tr key={o.id} style={{ verticalAlign: 'middle' }}>
                        <td className="ps-4" style={{ color: '#64748b', fontWeight: 600 }}>#{o.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%',
                              background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: '#6366f1',
                            }}>
                              {o.user[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{o.user}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>{o.total.toFixed(2)} DH</td>
                        <td style={{ color: '#64748b' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                            background: st.bg, color: st.color,
                          }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions + pending */}
        <div className="col-xl-4 d-flex flex-column gap-4">

          {/* Quick actions */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Actions rapides</h6>
            {[
              { href: '/admin/products', label: 'Ajouter un produit', icon: 'fas fa-plus-circle', color: '#6366f1', bg: '#eef2ff' },
              { href: '/admin/orders',   label: 'Gérer les commandes', icon: 'fas fa-clipboard-list', color: '#f59e0b', bg: '#fffbeb' },
              { href: '/admin/users',    label: 'Voir les utilisateurs', icon: 'fas fa-user-friends', color: '#10b981', bg: '#ecfdf5' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                textDecoration: 'none', color: '#1e293b',
                fontSize: 13, fontWeight: 500,
                marginBottom: 8,
                border: '1px solid #f1f5f9',
                transition: 'background .15s',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={a.icon} style={{ color: a.color, fontSize: 15 }} />
                </div>
                {a.label}
                <i className="fas fa-chevron-right ms-auto" style={{ fontSize: 11, color: '#cbd5e1' }} />
              </Link>
            ))}
          </div>

          {/* Pending orders summary */}
          {stats && (
            <div style={{
              borderRadius: 16, padding: '22px',
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              boxShadow: '0 4px 20px rgba(99,102,241,.35)',
            }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'rgba(255,255,255,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-clock" style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Commandes en attente</div>
                  <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
                    {stats.pending_orders}
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 8, padding: '3px', marginBottom: 12 }}>
                <div style={{
                  height: 6, borderRadius: 6,
                  background: '#fff',
                  width: stats.total_orders
                    ? `${Math.round((stats.pending_orders / stats.total_orders) * 100)}%`
                    : '0%',
                }} />
              </div>
              <Link href="/admin/orders" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,.15)', color: '#fff',
                padding: '7px 14px', borderRadius: 8,
                textDecoration: 'none', fontSize: 13, fontWeight: 500,
              }}>
                Traiter maintenant <i className="fas fa-arrow-right" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
