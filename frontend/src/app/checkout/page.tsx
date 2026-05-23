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
    city: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    async function fetchCart() {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('401')) { router.push('/login'); return; }
        setError(msg || 'Impossible de charger le panier');
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

    if (!formData.address || !formData.city || !formData.postal_code || !formData.country) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      await createOrder(formData);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h2 className="text-center fw-bold mb-4">Checkout</h2>
        <div className="alert alert-info text-center">Votre panier est vide.</div>
        <div className="text-center mt-4">
          <Link href="/products" className="btn btn-primary">Continuer les achats</Link>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold text-primary">
            📦 Livraison &amp; Paiement
          </h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-4">
            {/* Order summary */}
            <div className="col-md-5">
              <h5 className="fw-bold mb-3">Résumé de la commande</h5>
              <div className="list-group list-group-flush mb-3">
                {cart.items.map(item => (
                  <div key={item.id} className="list-group-item px-0 d-flex justify-content-between">
                    <div>
                      <p className="mb-0 fw-semibold">{item.product.name}</p>
                      <small className="text-muted">Qté : {item.quantity}</small>
                    </div>
                    <span className="fw-bold text-success">
                      {(item.product.price * item.quantity).toFixed(2)} DH
                    </span>
                  </div>
                ))}
              </div>
              <h5 className="text-end fw-bold">
                💰 Total :{' '}
                <span className="text-success">{total.toFixed(2)} DH</span>
              </h5>
            </div>

            {/* Shipping form */}
            <div className="col-md-7">
              <h5 className="fw-bold mb-3">Informations de livraison</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label fw-semibold">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    placeholder="ex : 123 Rue Hassan II"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="city" className="form-label fw-semibold">Ville</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-control"
                    placeholder="Casablanca, Rabat..."
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="postal_code" className="form-label fw-semibold">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    className="form-control"
                    placeholder="20000"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="country" className="form-label fw-semibold">Pays</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="form-control"
                    placeholder="Maroc"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? 'Traitement...' : '✅ Confirmer la commande'}
                </button>

                <Link href="/cart" className="btn btn-outline-secondary w-100 mt-2">
                  Retour au panier
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
