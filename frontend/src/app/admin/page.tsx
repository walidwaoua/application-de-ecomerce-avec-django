'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminStats, AdminOrder } from '@/lib/api';

const CARDS = (s: AdminStats) => [
  { label: 'Chiffre d’affaires', value: `${s.revenue.toLocaleString('fr-FR')} DH`, sub: 'Commandes payées', icon: 'fas fa-coins' },
  { label: 'Commandes totales', value: s.total_orders, sub: `${s.pending_orders} en attente`, icon: 'fas fa-shopping-bag' },
  { label: 'Produits', value: s.total_products, sub: 'Dans le catalogue', icon: 'fas fa-box-open' },
  { label: 'Utilisateurs', value: s.total_users, sub: 'Comptes inscrits', icon: 'fas fa-users' },
];

const STATUS = (o: AdminOrder) =>
  o.isDelivered ? 'Livrée' :
  o.isPaid ? 'Payée' :
  o.is_validated ? 'Validée' : 'En attente';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.orders()])
      .then(([s, o]) => { setStats(s); setOrders(o.results.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="dashboard-spinner" />
      <span>Chargement du tableau de bord…</span>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <style jsx>{`
        .admin-dashboard { width: 100%; color: #f5f5f5; }
        .dashboard-loading { display: grid; min-height: 360px; place-content: center; justify-items: center; gap: 12px; color: #a4a4a4; font-size: 13px; }
        .dashboard-spinner { width: 30px; height: 30px; border: 3px solid #444; border-top-color: #f5f5f5; border-radius: 50%; animation: dashboard-spin .75s linear infinite; }
        @keyframes dashboard-spin { to { transform: rotate(360deg); } }
        .dashboard-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px; padding-top: 4px; }
        .eyebrow { margin: 0 0 8px; color: #909090; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 750; letter-spacing: -.035em; }
        .date { display: flex; align-items: center; gap: 7px; margin: 8px 0 0; color: #a0a0a0; font-size: 12px; text-transform: capitalize; }
        .date i { color: #cecece; }
        .primary-action { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #5a5a5a; border-radius: 999px; background: #282828; color: #f8f8f8; padding: 8px 12px; font-size: 11px; font-weight: 750; text-decoration: none; white-space: nowrap; }
        .primary-action:hover { border-color: #777; background: #353535; color: #fff; text-decoration: none; }
        .dashboard-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .metric-card { min-width: 0; padding: 16px; border: 1px solid #343434; border-radius: 9px; background: #202020; }
        .metric-icon { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid #494949; border-radius: 7px; background: #292929; color: #e4e4e4; font-size: 13px; }
        .metric-value { margin-top: 18px; color: #fff; font-size: 23px; font-weight: 780; letter-spacing: -.04em; line-height: 1; overflow-wrap: anywhere; }
        .metric-label { margin-top: 8px; color: #d0d0d0; font-size: 12px; font-weight: 650; }
        .metric-sub { margin-top: 3px; color: #858585; font-size: 11px; }
        .dashboard-main { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 16px; align-items: start; }
        .panel { min-width: 0; overflow: hidden; border: 1px solid #343434; border-radius: 9px; background: #202020; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 16px; border-bottom: 1px solid #343434; }
        .panel-title { margin: 0; color: #f7f7f7; font-size: 13px; font-weight: 750; }
        .panel-description { margin: 3px 0 0; color: #898989; font-size: 11px; }
        .panel-link, .pending-link { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #4d4d4d; border-radius: 999px; background: #292929; color: #fff !important; padding: 6px 10px; font-size: 10px; font-weight: 700; text-decoration: none !important; white-space: nowrap; }
        .panel-link:hover, .panel-link:focus-visible, .pending-link:hover, .pending-link:focus-visible { border-color: #747474; background: #363636; color: #fff !important; text-decoration: none !important; }
        .orders-wrap { overflow-x: auto; }
        .orders-table { width: 100%; min-width: 590px; border-collapse: collapse; font-size: 12px; }
        .orders-table th { padding: 11px 16px; border-bottom: 1px solid #343434; color: #858585; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
        .orders-table td { padding: 13px 16px; border-bottom: 1px solid #2e2e2e; color: #c6c6c6; vertical-align: middle; }
        .orders-table tbody tr:hover { background: #252525; }
        .orders-table tr:last-child td { border-bottom: 0; }
        .order-id, .order-total { color: #f3f3f3 !important; font-weight: 700; }
        .customer { display: flex; align-items: center; gap: 8px; color: #ebebeb; font-weight: 600; }
        .customer-avatar { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid #505050; border-radius: 50%; background: #303030; color: #f2f2f2; font-size: 11px; font-weight: 800; }
        .order-date { color: #999; }
        .status { display: inline-flex; border: 1px solid #4a4a4a; border-radius: 999px; background: #2a2a2a; color: #e6e6e6; padding: 4px 8px; font-size: 10px; font-weight: 700; white-space: nowrap; }
        .empty { padding: 44px 16px; color: #929292; font-size: 13px; text-align: center; }
        .side-stack { display: grid; gap: 16px; }
        .quick-actions { padding: 8px; }
        .quick-heading { margin: 6px 8px 10px; color: #f4f4f4; font-size: 13px; font-weight: 750; }
        .quick-action { display: flex; align-items: center; gap: 9px; margin: 6px 0; padding: 6px 9px 6px 6px; border: 1px solid #454545; border-radius: 999px; background: #272727; color: #fff !important; font-size: 11px; font-weight: 650; text-decoration: none !important; }
        .quick-action:hover, .quick-action:focus-visible { border-color: #727272; background: #333; color: #fff !important; text-decoration: none !important; }
        .quick-icon { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid #484848; border-radius: 7px; background: #2c2c2c; color: #fff; font-size: 12px; }
        .quick-arrow { margin-left: auto; color: #c5c5c5; font-size: 10px; }
        .pending-card { padding: 17px; border: 1px solid #464646; border-radius: 9px; background: #272727; }
        .pending-label { color: #b8b8b8; font-size: 11px; }
        .pending-value { margin-top: 4px; color: #fff; font-size: 25px; font-weight: 800; letter-spacing: -.04em; }
        .progress { height: 5px; margin: 15px 0 12px; overflow: hidden; border-radius: 999px; background: #434343; }
        .progress > div { height: 100%; border-radius: inherit; background: #f1f1f1; }
        @media (max-width: 1200px) { .dashboard-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-main { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 640px) { .dashboard-header { flex-direction: column; } .dashboard-stats { grid-template-columns: minmax(0, 1fr); } h1 { font-size: 25px; } }
      `}</style>

      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Tableau de bord</h1>
          <p className="date"><i className="fas fa-calendar-alt" />{today}</p>
        </div>
        <Link href="/admin/products" className="admin-action-pill"><i className="fas fa-plus" /> Nouveau produit</Link>
      </header>

      {stats && <section className="dashboard-stats grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {CARDS(stats).map(card => (
          <article className="metric-card" key={card.label}>
            <div className="metric-icon"><i className={card.icon} /></div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-label">{card.label}</div>
            <div className="metric-sub">{card.sub}</div>
          </article>
        ))}
      </section>}

      <section className="dashboard-main grid-cols-1 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Commandes récentes</h2>
              <p className="panel-description">6 dernières commandes reçues</p>
            </div>
            <Link href="/admin/orders" className="admin-action-pill">Voir tout <i className="fas fa-arrow-right" /></Link>
          </div>
          {orders.length === 0 ? <div className="empty">Aucune commande.</div> : (
            <div className="orders-wrap">
              <table className="orders-table">
                <thead><tr><th>#</th><th>Client</th><th>Total</th><th>Date</th><th>Statut</th></tr></thead>
                <tbody>{orders.map(o => (
                  <tr key={o.id}>
                    <td className="order-id">#{o.id}</td>
                    <td><div className="customer"><span className="customer-avatar">{o.user[0]?.toUpperCase()}</span>{o.user}</div></td>
                    <td className="order-total">{o.total.toFixed(2)} DH</td>
                    <td className="order-date">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td><span className="status">{STATUS(o)}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        <div className="side-stack">
          <div className="panel quick-actions">
            <h2 className="quick-heading">Actions rapides</h2>
            {[
              { href: '/admin/products', label: 'Ajouter un produit', icon: 'fas fa-plus' },
              { href: '/admin/orders', label: 'Gérer les commandes', icon: 'fas fa-clipboard-list' },
              { href: '/admin/users', label: 'Voir les utilisateurs', icon: 'fas fa-users' },
            ].map(action => (
              <Link key={action.href} href={action.href} className="admin-action-pill">
                <span className="quick-icon"><i className={action.icon} /></span>
                {action.label}<i className="fas fa-chevron-right quick-arrow" />
              </Link>
            ))}
          </div>

          {stats && <div className="pending-card">
            <div className="pending-label">Commandes en attente</div>
            <div className="pending-value">{stats.pending_orders}</div>
            <div className="progress"><div style={{ width: stats.total_orders ? `${Math.round((stats.pending_orders / stats.total_orders) * 100)}%` : '0%' }} /></div>
            <Link href="/admin/orders" className="admin-action-pill">Traiter maintenant <i className="fas fa-arrow-right" /></Link>
          </div>}
        </div>
      </section>
    </div>
  );
}
