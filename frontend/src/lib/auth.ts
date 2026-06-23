const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type AuthResponse = {
  access: string;
  refresh: string;
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

// Token storage utilities
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    // Dispatch un event custom pour notifier que les tokens ont changé
    window.dispatchEvent(new Event('auth-tokens-changed'));
  }
}

export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Dispatch un event custom pour notifier que les tokens ont été supprimés
    window.dispatchEvent(new Event('auth-tokens-changed'));
  }
}

async function postAuth<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function loginUser(payload: { username: string; password: string }): Promise<AuthResponse> {
  const response = await postAuth<AuthResponse>("/api/auth/login/", payload);
  // Save tokens to localStorage
  setTokens(response.access, response.refresh);
  return response;
}

export async function registerUser(payload: {
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
}): Promise<AuthResponse> {
  const response = await postAuth<AuthResponse>("/api/auth/register/", payload);
  // Save tokens to localStorage
  setTokens(response.access, response.refresh);
  return response;
}

export async function getCurrentUser(): Promise<AuthResponse | null> {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/user/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthResponse;
  } catch (error) {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const accessToken = getAccessToken();
    if (accessToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    // Always clear tokens on logout
    clearTokens();
  }
}
