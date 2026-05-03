"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstname: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    password1: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      router.push("/");
      router.refresh();
    } catch (caughtError) {
      if (typeof caughtError === "object" && caughtError && "errors" in caughtError) {
        const errors = (caughtError as { errors?: Record<string, string[]> }).errors;
        const firstError = errors
          ? Object.values(errors).flat().filter(Boolean)[0]
          : undefined;
        setError(firstError || "Une erreur est survenue pendant l'inscription.");
      } else if (typeof caughtError === "object" && caughtError && "detail" in caughtError) {
        setError(String((caughtError as { detail?: string }).detail));
      } else {
        setError("Une erreur est survenue pendant l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center mt-4 mt-lg-5">
      <div className="col-12 col-lg-8">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-lg-5">
            <h2 className="fw-bold text-center mb-2">Creer un compte</h2>
            <p className="text-muted text-center mb-4">
              Rejoins HomyZone en quelques secondes.
            </p>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={handleSubmit} className="row g-3">
              {[
                ["username", "Nom d'utilisateur"],
                ["email", "Email"],
                ["firstname", "Prenom"],
                ["lastName", "Nom"],
                ["phone", "Telephone"],
                ["address", "Adresse"],
                ["city", "Ville"],
                ["postalCode", "Code postal"],
                ["country", "Pays"],
              ].map(([field, label]) => (
                <div key={field} className="col-12 col-md-6">
                  <label className="form-label" htmlFor={field}>
                    {label}
                  </label>
                  <input
                    id={field}
                    className="form-control"
                    value={form[field as keyof typeof form]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    required={field !== "phone" && field !== "address" && field !== "city" && field !== "postalCode" && field !== "country"}
                  />
                </div>
              ))}

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="password1">
                  Mot de passe
                </label>
                <input
                  id="password1"
                  type="password"
                  className="form-control"
                  value={form.password1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password1: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="password2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="password2"
                  type="password"
                  className="form-control"
                  value={form.password2}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password2: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? "Creation..." : "Creer mon compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
