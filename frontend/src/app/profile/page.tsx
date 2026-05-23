'use client';

import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile } from '@/lib/api';
import type { UserProfile } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('401')) { router.push('/login'); return; }
        setError(msg || 'Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const updated = await updateUserProfile(formData);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link href="/login" className="btn btn-primary">Se connecter</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Profil non trouvé</div>
      </div>
    );
  }

  const client = profile.client;

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-center">
        <i className="fas fa-user-circle me-2 text-primary" />
        Mon Profil
      </h2>

      <div className="row g-4">
        {/* Personal info */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
              <span><i className="fas fa-id-card me-2" />Informations personnelles</span>
              {!editing && (
                <button className="btn btn-sm btn-light" onClick={() => setEditing(true)}>
                  Modifier
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      name="first_name"
                      className="form-control"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-control"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                      {submitting ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setEditing(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : client ? (
                <div>
                  <p className="mb-2">
                    <i className="fas fa-user me-2 text-muted" />
                    <strong>Nom :</strong> {client.lastName}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-user me-2 text-muted" />
                    <strong>Prénom :</strong> {client.firstname}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-envelope me-2 text-muted" />
                    <strong>Email :</strong> {client.email}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-phone me-2 text-muted" />
                    <strong>Téléphone :</strong> {client.phone || '—'}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-map-marker-alt me-2 text-muted" />
                    <strong>Adresse :</strong> {client.address || '—'}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-city me-2 text-muted" />
                    <strong>Ville :</strong> {client.city || '—'}
                  </p>
                  <p className="mb-2">
                    <i className="fas fa-mail-bulk me-2 text-muted" />
                    <strong>Code postal :</strong> {client.postalCode || '—'}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-globe me-2 text-muted" />
                    <strong>Pays :</strong> {client.country || '—'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2">
                    <strong>Prénom :</strong> {profile.first_name || '—'}
                  </p>
                  <p className="mb-2">
                    <strong>Nom :</strong> {profile.last_name || '—'}
                  </p>
                  <p className="mb-0">
                    <strong>Email :</strong> {profile.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white fw-bold">
              <i className="fas fa-box me-2" />Mes Commandes
            </div>
            <div className="card-body p-0">
              {profile.orders && profile.orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Validée</th>
                        <th>Payée</th>
                        <th>Livrée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.orders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.total.toFixed(2)} DH</td>
                          <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>
                            {order.isCancelled
                              ? <span className="badge bg-danger" style={{ fontSize: 11 }}>Annulée</span>
                              : order.is_validated
                                ? <i className="fas fa-check-circle text-success" />
                                : <i className="fas fa-hourglass-half text-warning" />}
                          </td>
                          <td>
                            {order.isCancelled ? '—'
                              : order.isPaid
                                ? <i className="fas fa-money-bill text-success" />
                                : <i className="fas fa-money-check-alt text-muted" />}
                          </td>
                          <td>
                            {order.isCancelled ? '—'
                              : order.isDelivered
                                ? <i className="fas fa-truck text-primary" />
                                : <i className="fas fa-box-open text-secondary" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info m-3">Aucune commande pour l&apos;instant.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
