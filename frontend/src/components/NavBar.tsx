"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";

const categories = ["Canapé", "Salon", "Meuble"];

type User = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
};

export function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getCurrentUser();
      if (response?.user) {
        setUser(response.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = "/";
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          HomyZone
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarColor01"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Basculer la navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" href="/">
                Accueil
              </Link>
            </li>

            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                data-bs-toggle="dropdown"
                type="button"
              >
                Categorie
              </button>
              <ul className="dropdown-menu">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      className="dropdown-item"
                      href={`/category/${encodeURIComponent(category)}`}
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" href="/cart">
                <i className="fas fa-shopping-cart me-1" /> Panier
              </Link>
            </li>
          </ul>

          <form
            className="d-flex me-3 rounded-3 bg-white px-2 py-1 shadow-sm search-form"
            method="GET"
            action="/search"
            style={{ maxWidth: "300px" }}
          >
            <span className="text-muted d-flex align-items-center me-2">
              <i className="fas fa-search" />
            </span>
            <input
              className="form-control border-0 shadow-0"
              type="search"
              name="q"
              placeholder="Rechercher un produit..."
              aria-label="Search"
            />
          </form>

          <ul className="navbar-nav mb-2 mb-lg-0">
            {!loading && !user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">
                    <i className="fas fa-sign-in-alt me-1" /> Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/register">
                    <i className="fas fa-user-plus me-1" /> Creer un compte
                  </Link>
                </li>
              </>
            ) : loading ? (
              <li className="nav-item">
                <span className="nav-link">Chargement...</span>
              </li>
            ) : (
              <>
                {user?.is_staff && (
                  <li className="nav-item">
                    <Link className="nav-link" href="/admin">
                      <i className="fas fa-cog me-1" /> Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" href="/profile">
                    <i className="fas fa-user me-1" /> {user?.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={handleLogout}
                    style={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    <i className="fas fa-sign-out-alt me-1" /> Déconnexion
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
