'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminOrder } from '@/lib/api';

const Badge = ({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) => (
  <span className={`order-badge${on ? ' is-on' : ''}`}>{on ? onLabel : offLabel}</span>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    adminApi.orders().then(r => setOrders(r.results)).finally(() => setLoading(false));
  }, []);

  const toggle = async (order: AdminOrder, field: 'isPaid' | 'isDelivered' | 'is_validated' | 'isCancelled') => {
    setUpdating(order.id);
    const updated = await adminApi.updateOrder(order.id, { [field]: !order[field] });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updated } : o));
    setUpdating(null);
  };

  const filtered = orders.filter(o => {
    if (filter === 'pending') return !o.is_validated && !o.isCancelled;
    if (filter === 'paid') return o.isPaid && !o.isCancelled;
    if (filter === 'delivered') return o.isDelivered && !o.isCancelled;
    if (filter === 'cancelled') return o.isCancelled;
    return true;
  });

  return (
    <div className="orders-page">
      <style jsx>{`
        .orders-page { color: #f4f4f4; }
        .orders-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 20px; }
        .orders-eyebrow { margin: 0 0 6px; color: #909090; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        h1 { margin: 0; color: #fff; font-size: 27px; font-weight: 750; letter-spacing: -.035em; }
        .orders-count { margin: 6px 0 0; color: #999; font-size: 12px; }
        .filters { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
        .filter-button { border: 1px solid #484848; border-radius: 7px; background: #242424; color: #c6c6c6; padding: 7px 10px; font-size: 11px; font-weight: 700; }
        .filter-button:hover { border-color: #707070; background: #303030; color: #fff; }
        .filter-button.active { border-color: #6c6c6c; background: #f0f0f0; color: #171717; }
        .orders-panel { overflow: hidden; border: 1px solid #343434; border-radius: 9px; background: #202020; }
        .orders-table-wrap { overflow-x: auto; }
        .orders-table { width: 100%; min-width: 970px; border-collapse: collapse; font-size: 12px; }
        .orders-table th { padding: 12px 16px; border-bottom: 1px solid #343434; color: #858585; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
        .orders-table td { padding: 13px 16px; border-bottom: 1px solid #2e2e2e; color: #c9c9c9; vertical-align: middle; }
        .orders-table tbody tr { transition: background .15s ease, opacity .15s ease; }
        .orders-table tbody tr:hover { background: #252525; }
        .orders-table tr.cancelled { background: #252525; }
        .orders-table tr:last-child td { border-bottom: 0; }
        .order-id, .order-total { color: #f3f3f3; font-weight: 750; }
        .address { max-width: 160px; overflow: hidden; color: #a9a9a9; text-overflow: ellipsis; white-space: nowrap; }
        .order-date { color: #999; white-space: nowrap; }
        .status-control { border: 0; outline: none; background: transparent; padding: 0; }
        .status-control:not(:disabled) { cursor: pointer; }
        .status-control:focus-visible .order-badge { outline: 2px solid #e0e0e0; outline-offset: 2px; }
        .order-badge { display: inline-flex; border: 1px solid #484848; border-radius: 999px; background: #292929; color: #bdbdbd; padding: 4px 7px; font-size: 10px; font-weight: 700; line-height: 1; white-space: nowrap; }
        .order-badge.is-on { border-color: #6a6a6a; background: #e8e8e8; color: #171717; }
        .empty { padding: 42px 16px; color: #929292; font-size: 13px; text-align: center; }
        .loading { display: grid; min-height: 220px; place-items: center; }
        .spinner { width: 28px; height: 28px; border: 3px solid #444; border-top-color: #fff; border-radius: 50%; animation: orders-spin .75s linear infinite; }
        @keyframes orders-spin { to { transform: rotate(360deg); } }
        @media (max-width: 760px) { .orders-header { flex-direction: column; } .filters { justify-content: flex-start; } h1 { font-size: 25px; } }
      `}</style>

      <header className="orders-header">
        <div>
          <p className="orders-eyebrow">Ventes</p>
          <h1>Commandes</h1>
          <p className="orders-count">{orders.length} commande(s)</p>
        </div>
        <div className="filters">
          {([
            { key: 'all', label: 'Tout' },
            { key: 'pending', label: 'En attente' },
            { key: 'paid', label: 'Payées' },
            { key: 'delivered', label: 'Livrées' },
            { key: 'cancelled', label: 'Annulées' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`filter-button${filter === f.key ? ' active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <section className="orders-panel">
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead><tr><th>#</th><th>Client</th><th>Adresse</th><th>Total</th><th>Date</th><th>Validée</th><th>Payée</th><th>Livrée</th><th>Annulée</th></tr></thead>
              <tbody>{filtered.map(o => (
                <tr key={o.id} className={o.isCancelled ? 'cancelled' : undefined} style={{ opacity: updating === o.id ? .5 : 1 }}>
                  <td className="order-id">#{o.id}</td>
                  <td>{o.user}</td>
                  <td><div className="address">{o.city || o.shippingAddress || '—'}</div></td>
                  <td className="order-total">{o.total.toFixed(2)} DH</td>
                  <td className="order-date">{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><button className="status-control" disabled={o.isCancelled} onClick={() => toggle(o, 'is_validated')}><Badge on={o.is_validated} onLabel="Oui" offLabel="En attente" /></button></td>
                  <td><button className="status-control" disabled={o.isCancelled} onClick={() => toggle(o, 'isPaid')}><Badge on={o.isPaid} onLabel="Payée" offLabel="Non payée" /></button></td>
                  <td><button className="status-control" disabled={o.isCancelled} onClick={() => toggle(o, 'isDelivered')}><Badge on={o.isDelivered} onLabel="Livrée" offLabel="En cours" /></button></td>
                  <td><button className="status-control" onClick={() => toggle(o, 'isCancelled')}><Badge on={o.isCancelled} onLabel="Annulée" offLabel="Non annulée" /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {filtered.length === 0 && <div className="empty">Aucune commande trouvée.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
