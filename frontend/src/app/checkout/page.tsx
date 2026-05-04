'use client';

import { useEffect, useState } from 'react';
import { getCart, createOrder } from '@/lib/api';
import type { Cart } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.phone) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      await createOrder(formData);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h2 className="text-center fw-bold mb-4">Checkout</h2>
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
      <h2 className="text-center fw-bold mb-4">Checkout</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <h4>Résumé de la commande</h4>
          <div className="card mb-4">
            <div className="card-body">
              {cart.items.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-3">
                  <div>
                    <p className="mb-1">{item.product.name}</p>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span className="fw-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5 className="fw-bold">${cart.total.toFixed(2)}</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h4>Informations de livraison</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Adresse</label>
              <textarea 
                id="address"
                name="address"
                className="form-control"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Téléphone</label>
              <input 
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-success w-100"
              disabled={submitting}
            >
              {submitting ? 'Traitement...' : 'Confirmer la commande'}
            </button>
            
            <Link href="/cart" className="btn btn-outline-secondary w-100 mt-2">
              Retour au panier
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
