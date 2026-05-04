'use client';

import { useEffect, useState } from 'react';
import { getCart, removeFromCart } from '@/lib/api';
import type { Cart } from '@/lib/api';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      setCart(prev => 
        prev ? { ...prev, items: prev.items.filter(item => item.id !== itemId) } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
        <h2 className="text-center fw-bold mb-4">Panier</h2>
        <div className="alert alert-info text-center">
          Votre panier est vide.
        </div>
        <div className="text-center mt-4">
          <Link href="/products" className="btn btn-primary">Continuer les achats</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">Panier</h2>
      
      <div className="row">
        <div className="col-md-8">
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td>${item.product.price}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Résumé du panier</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Total:</span>
                <span className="fw-bold">${cart.total.toFixed(2)}</span>
              </div>
              <Link 
                href="/checkout" 
                className="btn btn-success w-100"
              >
                Procéder au paiement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
