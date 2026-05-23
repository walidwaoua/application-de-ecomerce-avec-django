'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Product } from '@/types/product';

const EMPTY: Partial<Product> = { name: '', category: '', brand: '', price: 0, countInStock: 0, description: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.products().then(r => setProducts(r.results)).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (p: Product) => { setForm(p); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        const created = await adminApi.createProduct(form);
        setProducts(prev => [created, ...prev]);
      } else {
        const updated = await adminApi.updateProduct(form.id!, form);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await adminApi.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Produits</h4>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>{products.length} produit(s)</p>
        </div>
        <button className="btn btn-sm fw-semibold" style={{ background: '#6366f1', color: '#fff', borderRadius: 8, padding: '8px 16px' }} onClick={openCreate}>
          <i className="fas fa-plus me-2" />Ajouter
        </button>
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
                  <th className="ps-4">Produit</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                          : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fas fa-image text-muted" />
                            </div>}
                        <span className="fw-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#eef2ff', color: '#6366f1', fontWeight: 500 }}>{p.category || '—'}</span></td>
                    <td className="fw-semibold">{p.price} DH</td>
                    <td>
                      <span className="badge" style={{ background: (p.countInStock ?? 0) > 0 ? '#ecfdf5' : '#fef2f2', color: (p.countInStock ?? 0) > 0 ? '#10b981' : '#ef4444' }}>
                        {p.countInStock ?? 0}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm me-2" style={{ background: '#f1f5f9', color: '#475569', borderRadius: 6 }} onClick={() => openEdit(p)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#ef4444', borderRadius: 6 }} onClick={() => handleDelete(p.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                {(['name', 'brand', 'category', 'description'] as const).map(f => (
                  <div className="mb-3" key={f}>
                    <label className="form-label text-capitalize" style={{ fontSize: 13, fontWeight: 500 }}>{f}</label>
                    {f === 'description'
                      ? <textarea className="form-control form-control-sm" rows={2} value={(form as any)[f] ?? ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
                      : <input className="form-control form-control-sm" value={(form as any)[f] ?? ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />}
                  </div>
                ))}
                <div className="row g-2">
                  <div className="col">
                    <label className="form-label" style={{ fontSize: 13, fontWeight: 500 }}>Prix (DH)</label>
                    <input type="number" className="form-control form-control-sm" value={form.price ?? 0} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
                  </div>
                  <div className="col">
                    <label className="form-label" style={{ fontSize: 13, fontWeight: 500 }}>Stock</label>
                    <input type="number" className="form-control form-control-sm" value={form.countInStock ?? 0} onChange={e => setForm(p => ({ ...p, countInStock: +e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-sm btn-light" onClick={() => setModal(null)}>Annuler</button>
                <button className="btn btn-sm fw-semibold" style={{ background: '#6366f1', color: '#fff' }} disabled={saving} onClick={handleSave}>
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
