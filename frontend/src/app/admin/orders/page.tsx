'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminOrder } from '@/lib/api';

const Badge = ({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
    background: on ? '#ecfdf5' : '#f8fafc',
    color: on ? '#10b981' : '#94a3b8',
  }}>
    {on ? onLabel : offLabel}
  </span>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    adminApi.orders().then(r => setOrders(r.results)).finally(() => setLoading(false));
  }, []);

  const toggle = async (order: AdminOrder, field: 'isPaid' | 'isDelivered' | 'is_validated') => {
    setUpdating(order.id);
    const updated = await adminApi.updateOrder(order.id, { [field]: !order[field] });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updated } : o));
    setUpdating(null);
  };

  const filtered = orders.filter(o => {
    if (filter === 'pending')   return !o.is_validated && !o.isCancelled;
    if (filter === 'paid')      return o.isPaid && !o.isCancelled;
    if (filter === 'delivered') return o.isDelivered && !o.isCancelled;
    if (filter === 'cancelled') return o.isCancelled;
    return true;
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Commandes</h4>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>{orders.length} commande(s)</p>
        </div>
        <div className="d-flex gap-2">
          {([
            { key: 'all',       label: 'Tout' },
            { key: 'pending',   label: 'En attente' },
            { key: 'paid',      label: 'Payées' },
            { key: 'delivered', label: 'Livrées' },
            { key: 'cancelled', label: 'Annulées' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 6, border: 'none',
                background: filter === f.key
                  ? f.key === 'cancelled' ? '#ef4444' : '#6366f1'
                  : '#f1f5f9',
                color: filter === f.key ? '#fff' : '#64748b',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th className="ps-4">#</th>
                  <th>Client</th>
                  <th>Adresse</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Validée</th>
                  <th>Payée</th>
                  <th>Livrée</th>
                  <th>Annulée</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{
                    opacity: updating === o.id ? .5 : 1,
                    background: o.isCancelled ? '#fff5f5' : undefined,
                  }}>
                    <td className="ps-4 fw-semibold">#{o.id}</td>
                    <td>{o.user}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.city || o.shippingAddress || '—'}
                    </td>
                    <td className="fw-semibold">{o.total.toFixed(2)} DH</td>
                    <td style={{ color: '#64748b' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" disabled={o.isCancelled} onClick={() => toggle(o, 'is_validated')}>
                        <Badge on={o.is_validated} onLabel="✓ Oui" offLabel="En attente" />
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" disabled={o.isCancelled} onClick={() => toggle(o, 'isPaid')}>
                        <Badge on={o.isPaid} onLabel="✓ Payée" offLabel="Non payée" />
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" disabled={o.isCancelled} onClick={() => toggle(o, 'isDelivered')}>
                        <Badge on={o.isDelivered} onLabel="✓ Livrée" offLabel="En cours" />
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => toggle(o, 'isCancelled')}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                          background: o.isCancelled ? '#fef2f2' : '#f8fafc',
                          color: o.isCancelled ? '#dc2626' : '#94a3b8',
                        }}>
                          {o.isCancelled ? '✕ Annulée' : 'Non annulée'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-muted py-4" style={{ fontSize: 14 }}>Aucune commande trouvée.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
