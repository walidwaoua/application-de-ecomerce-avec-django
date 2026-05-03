import { Product } from "@/types/product";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ProductsResponse = {
  results: Product[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

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
