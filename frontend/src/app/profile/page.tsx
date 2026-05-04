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
        const profileData = await getUserProfile();
        setProfile(profileData);
        setFormData({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
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
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">Mon Profil</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Informations personnelles</h5>
              {!editing && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Modifier
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">Prénom</label>
                    <input 
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-control"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="last_name" className="form-label">Nom</label>
                    <input 
                      type="text"
                      id="last_name"
                      name="last_name"
                      className="form-control"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={submitting}
                    >
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
              ) : (
                <div>
                  <p className="mb-2"><strong>Prénom:</strong> {profile.first_name}</p>
                  <p className="mb-2"><strong>Nom:</strong> {profile.last_name}</p>
                  <p className="mb-0"><strong>Email:</strong> {profile.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Mes commandes</h5>
            </div>
            <div className="card-body">
              {profile.orders && profile.orders.length > 0 ? (
                <div className="list-group list-group-flush">
                  {profile.orders.map(order => (
                    <div key={order.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Commande #{order.id}</h6>
                        <span className="badge bg-info">{order.status}</span>
                      </div>
                      <p className="text-muted small mb-2">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="d-flex justify-content-between">
                        <span>{order.items.length} article(s)</span>
                        <strong>${order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Aucune commande pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
