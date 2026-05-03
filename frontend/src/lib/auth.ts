const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type AuthResponse = {
  user: {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
  };
  client: {
    firstname: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  detail?: string;
  errors?: Record<string, string[]>;
};

async function postAuth<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export function loginUser(payload: { username: string; password: string }) {
  return postAuth<AuthResponse>("/api/auth/login/", payload);
}

export function registerUser(payload: {
  username: string;
  password1: string;
  password2: string;
  email: string;
  firstname: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}) {
  return postAuth<AuthResponse>("/api/auth/register/", payload);
}
