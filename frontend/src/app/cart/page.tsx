'use client';

import { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart } from '@/lib/api';
import type { Cart, CartItem } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401')) {
        router.push('/login');
        return;
      }
      setError(msg || 'Impossible de charger le panier');
    } finally {
      setLoading(false);
    }
  }

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      setUpdatingId(item.id);
      const updated = await updateCartItem(item.id, newQty);
      setCart(prev =>
        prev
          ? {
              ...prev,
              items: prev.items.map(i => (i.id === item.id ? { ...i, quantity: updated.quantity } : i)),
              total: prev.items.reduce(
                (sum, i) => sum + (i.id === item.id ? updated.quantity : i.quantity) * i.product.price,
                0
              ),
            }
          : null
      );
    } catch {
      setError('Erreur lors de la mise à jour de la quantité');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Supprimer ce produit du panier ?')) return;
    try {
      await removeFromCart(itemId);
      setCart(prev => {
        if (!prev) return null;
        const items = prev.items.filter(i => i.id !== itemId);
        const total = items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
        return { ...prev, items, total };
      });
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h2 className="text-center fw-bold mb-4">
          <i className="fas fa-shopping-cart me-2" />
          Mon Panier
        </h2>
        <div className="alert alert-warning text-center mt-4">Votre panier est vide.</div>
        <div className="text-center mt-3">
          <Link href="/products" className="btn btn-primary">Continuer les achats</Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const byCategory: Record<string, CartItem[]> = {};
  for (const item of cart.items) {
    const cat = item.product.category ?? 'Autres';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  const total = cart.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">
        <i className="fas fa-shopping-cart me-2" />
        MON PANIER PAR CATÉGORIE
      </h2>

      {Object.entries(byCategory).map(([category, items]) => (
        <div className="mb-5" key={category}>
          <h4 className="text-primary border-bottom pb-2">{category}</h4>
          <table className="table table-striped table-bordered shadow-sm rounded-4">
            <thead className="table-dark">
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Sous-total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={updatingId === item.id || item.quantity <= 1}
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        −
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={updatingId === item.id}
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.product.price} DH</td>
                  <td className="text-success fw-bold">
                    {(item.product.price * item.quantity).toFixed(2)} DH
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <hr />
      <div className="text-end">
        <h4 className="fw-bold">
          TOTAL GÉNÉRAL :{' '}
          <span className="text-success">{total.toFixed(2)} DH</span>
        </h4>
        <Link href="/checkout" className="btn btn-success mt-3">
          PASSER LA COMMANDE
        </Link>
      </div>
    </div>
  );
}
