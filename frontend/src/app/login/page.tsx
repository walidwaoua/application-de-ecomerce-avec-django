"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser({ username, password });
      window.location.href = "/";
    } catch (caughtError) {
      const message =
        typeof caughtError === "object" && caughtError && "detail" in caughtError
          ? String((caughtError as { detail?: string }).detail)
          : "Une erreur est survenue pendant la connexion.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mt-4 mt-lg-5">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-lg-5">
            <h2 className="fw-bold text-center mb-2">Connexion</h2>
            <p className="text-muted text-center mb-4">
              Accede a ton compte HomyZone.
            </p>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label" htmlFor="username">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
