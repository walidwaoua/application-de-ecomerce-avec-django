import { Product } from "@/types/product";
import { getAccessToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ProductsResponse = {
  results: Product[];
};

export type CartItem = {
  id: number;
  product: Product;
  quantity: number;
};

export type Cart = {
  id: number;
  items: CartItem[];
  total: number;
};

export type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
  is_validated: boolean;
  isPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  items: CartItem[];
};

export type ClientProfile = {
  firstname: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  client: ClientProfile | null;
  orders: Order[];
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const accessToken = getAccessToken();
  
  const headers = new Headers(options?.headers || {});
  
  // Add JWT token if available
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { 
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(params?: {
  query?: string;
  category?: string;
}): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}/api/products/`);

  if (params?.query) {
    url.searchParams.set("q", params.query);
  }

  if (params?.category) {
    url.searchParams.set("category", params.category);
  }

  try {
    const data = await fetchJson<ProductsResponse>(url.toString());
    return data.results;
  } catch {
    return [];
  }
}

export async function getProduct(id: string | number): Promise<Product> {
  const url = `${API_BASE_URL}/api/products/${id}/`;
  return fetchJson<Product>(url);
}

// Cart APIs
export async function getCart(): Promise<Cart> {
  const url = `${API_BASE_URL}/api/cart/`;
  return fetchJson<Cart>(url);
}

export async function addToCart(productId: number, quantity: number): Promise<CartItem> {
  const url = `${API_BASE_URL}/api/cart/add/`;
  return fetchJson<CartItem>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
  const url = `${API_BASE_URL}/api/cart/items/${itemId}/`;
  return fetchJson<CartItem>(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(itemId: number): Promise<void> {
  const url = `${API_BASE_URL}/api/cart/items/${itemId}/`;
  await fetch(url, { 
    method: "DELETE", 
    credentials: "include"
  });
}

// Checkout/Order APIs
export async function createOrder(data: {
  address: string;
  city: string;
  postal_code: string;
  country: string;
}): Promise<Order> {
  const url = `${API_BASE_URL}/api/orders/`;
  return fetchJson<Order>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function getOrders(): Promise<Order[]> {
  const url = `${API_BASE_URL}/api/orders/`;
  return fetchJson<Order[]>(url);
}

// Profile APIs
export async function getUserProfile(): Promise<UserProfile> {
  const url = `${API_BASE_URL}/api/profile/`;
  return fetchJson<UserProfile>(url);
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const url = `${API_BASE_URL}/api/profile/`;
  return fetchJson<UserProfile>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Admin types ──────────────────────────────────────────────────────────────
export type AdminStats = {
  total_products: number;
  total_orders: number;
  total_users: number;
  revenue: number;
  pending_orders: number;
};

export type AdminOrder = {
  id: number;
  user: string;
  total: number;
  created_at: string;
  is_validated: boolean;
  isPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  shippingAddress: string;
  city: string;
  country: string;
};

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  date_joined: string;
  is_active: boolean;
};

// ─── Admin API ────────────────────────────────────────────────────────────────
const A = `${API_BASE_URL}/api/admin`;

export const adminApi = {
  stats: () => fetchJson<AdminStats>(`${A}/stats/`),
  products: () => fetchJson<{ results: Product[] }>(`${A}/products/`),
  createProduct: (data: Partial<Product>) =>
    fetchJson<Product>(`${A}/products/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<Product>) =>
    fetchJson<Product>(`${A}/products/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    fetchJson<{ detail: string }>(`${A}/products/${id}/`, { method: 'DELETE' }),
  orders: () => fetchJson<{ results: AdminOrder[] }>(`${A}/orders/`),
  updateOrder: (id: number, data: Partial<AdminOrder>) =>
    fetchJson<AdminOrder>(`${A}/orders/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  users: () => fetchJson<{ results: AdminUser[] }>(`${A}/users/`),
};
