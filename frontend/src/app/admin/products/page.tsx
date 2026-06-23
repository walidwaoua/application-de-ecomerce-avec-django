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

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="products-page">
      <style jsx>{`
        .products-page { color: #f4f4f4; }
        .products-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
        .products-eyebrow { margin: 0 0 6px; color: #909090; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        h1 { margin: 0; color: #fff; font-size: 27px; font-weight: 750; letter-spacing: -.035em; }
        .products-count { margin: 6px 0 0; color: #999; font-size: 12px; }
        .primary-button { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #595959; border-radius: 7px; background: #f1f1f1; color: #151515; padding: 9px 12px; font-size: 12px; font-weight: 750; }
        .primary-button:hover { background: #fff; color: #000; }
        .products-panel { overflow: hidden; border: 1px solid #343434; border-radius: 9px; background: #202020; }
        .products-toolbar { display: flex; align-items: center; padding: 13px 14px; border-bottom: 1px solid #343434; }
        .search-wrap { position: relative; width: min(100%, 300px); }
        .search-icon { position: absolute; top: 50%; left: 11px; color: #929292; font-size: 12px; pointer-events: none; transform: translateY(-50%); }
        .search-input { width: 100%; border: 1px solid #494949; border-radius: 7px; outline: none; background: #171717; color: #f4f4f4; padding: 8px 10px 8px 31px; font-size: 12px; }
        .search-input::placeholder { color: #858585; }
        .search-input:focus { border-color: #8a8a8a; box-shadow: 0 0 0 3px rgba(255,255,255,.08); }
        .products-table-wrap { overflow-x: auto; }
        .products-table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: 12px; }
        .products-table th { padding: 12px 16px; border-bottom: 1px solid #343434; color: #858585; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
        .products-table td { padding: 13px 16px; border-bottom: 1px solid #2e2e2e; color: #c9c9c9; vertical-align: middle; }
        .products-table tbody tr:hover { background: #252525; }
        .products-table tr:last-child td { border-bottom: 0; }
        .product-cell { display: flex; align-items: center; gap: 11px; color: #f1f1f1; font-weight: 650; }
        .product-image, .product-placeholder { width: 38px; height: 38px; flex: 0 0 38px; border: 1px solid #484848; border-radius: 7px; object-fit: cover; }
        .product-placeholder { display: grid; place-items: center; background: #2b2b2b; color: #aaa; }
        .category-badge, .stock-badge { display: inline-flex; border: 1px solid #4a4a4a; border-radius: 999px; background: #2a2a2a; color: #dedede; padding: 4px 8px; font-size: 10px; font-weight: 700; }
        .stock-badge.out { border-color: #5b5b5b; background: #262626; color: #bdbdbd; }
        .price { color: #f2f2f2; font-weight: 700; white-space: nowrap; }
        .actions { display: flex; justify-content: flex-end; gap: 7px; }
        .icon-button { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid #474747; border-radius: 6px; background: #2a2a2a; color: #ededed; font-size: 12px; }
        .icon-button:hover { border-color: #737373; background: #363636; color: #fff; }
        .icon-button.delete { color: #d7d7d7; }
        .loading { display: grid; min-height: 220px; place-items: center; }
        .spinner { width: 28px; height: 28px; border: 3px solid #444; border-top-color: #fff; border-radius: 50%; animation: products-spin .75s linear infinite; }
        @keyframes products-spin { to { transform: rotate(360deg); } }
        .product-modal { background: rgba(0, 0, 0, .7); }
        .product-modal :global(.modal-content) { border: 1px solid #4a4a4a; border-radius: 10px; background: #202020; color: #f5f5f5; box-shadow: 0 24px 60px rgba(0,0,0,.45); }
        .product-modal :global(.modal-title) { color: #fff; font-size: 16px; }
        .product-modal :global(.btn-close) { filter: invert(1) grayscale(1) brightness(2); }
        .product-modal :global(.form-label) { color: #cfcfcf; font-size: 12px !important; font-weight: 650 !important; }
        .product-modal :global(.form-control) { border: 1px solid #4a4a4a; background: #171717; color: #f5f5f5; box-shadow: none; }
        .product-modal :global(.form-control:focus) { border-color: #8a8a8a; background: #171717; color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.08); }
        .product-modal :global(.btn-light) { border: 1px solid #505050; background: #303030; color: #f0f0f0; }
        .product-modal :global(.btn-light:hover) { background: #3a3a3a; color: #fff; }
        @media (max-width: 640px) { .products-header { flex-direction: column; } h1 { font-size: 25px; } .primary-button { width: 100%; justify-content: center; } }
      `}</style>

      <header className="products-header">
        <div>
          <p className="products-eyebrow">Catalogue</p>
          <h1>Produits</h1>
          <p className="products-count">{products.length} produit(s)</p>
        </div>
        <button className="primary-button" onClick={openCreate}><i className="fas fa-plus" />Ajouter</button>
      </header>

      <section className="products-panel">
        <div className="products-toolbar">
          <div className="search-wrap">
            <i className="fas fa-search search-icon" />
            <input className="search-input" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="products-table-wrap">
            <table className="products-table">
              <thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th className="text-end">Actions</th></tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id}>
                  <td><div className="product-cell">
                    {p.image ? <img className="product-image" src={p.image} alt={p.name} /> : <div className="product-placeholder"><i className="fas fa-image" /></div>}
                    <span>{p.name}</span>
                  </div></td>
                  <td><span className="category-badge">{p.category || '—'}</span></td>
                  <td className="price">{p.price} DH</td>
                  <td><span className={`stock-badge ${(p.countInStock ?? 0) > 0 ? '' : 'out'}`}>{p.countInStock ?? 0}</span></td>
                  <td><div className="actions">
                    <button className="icon-button" aria-label={`Modifier ${p.name}`} onClick={() => openEdit(p)}><i className="fas fa-edit" /></button>
                    <button className="icon-button delete" aria-label={`Supprimer ${p.name}`} onClick={() => handleDelete(p.id)}><i className="fas fa-trash" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <div className="modal d-block product-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                {(['name', 'brand', 'category', 'description'] as const).map(f => (
                  <div className="mb-3" key={f}>
                    <label className="form-label text-capitalize">{f}</label>
                    {f === 'description'
                      ? <textarea className="form-control form-control-sm" rows={2} value={(form as any)[f] ?? ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
                      : <input className="form-control form-control-sm" value={(form as any)[f] ?? ''} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />}
                  </div>
                ))}
                <div className="row g-2">
                  <div className="col"><label className="form-label">Prix (DH)</label><input type="number" className="form-control form-control-sm" value={form.price ?? 0} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} /></div>
                  <div className="col"><label className="form-label">Stock</label><input type="number" className="form-control form-control-sm" value={form.countInStock ?? 0} onChange={e => setForm(p => ({ ...p, countInStock: +e.target.value }))} /></div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-sm btn-light" onClick={() => setModal(null)}>Annuler</button>
                <button className="btn btn-sm primary-button" disabled={saving} onClick={handleSave}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
