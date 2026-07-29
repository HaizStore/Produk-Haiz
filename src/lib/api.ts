import { Product, StoreConfig, Category } from "./types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

// ---- Public ----

export function getProducts(): Promise<Product[]> {
  return request<Product[]>("/api/products");
}

export function getConfig(): Promise<StoreConfig> {
  return request<StoreConfig>("/api/config");
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

// ---- Admin ----

export function adminLogin(username: string, password: string) {
  return request<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function adminGetProducts(token: string) {
  return request<Product[]>("/api/admin/products", { headers: authHeaders(token) });
}

export function adminCreateProduct(token: string, product: Partial<Product>) {
  return request<Product>("/api/admin/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });
}

export function adminUpdateProduct(token: string, id: string, product: Partial<Product>) {
  return request<Product>(`/api/admin/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });
}

export function adminDeleteProduct(token: string, id: string) {
  return request<{ status: string }>(`/api/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function adminUpdateConfig(token: string, config: StoreConfig) {
  return request<StoreConfig>("/api/admin/config", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(config),
  });
}

export function adminChangePassword(token: string, currentPassword: string, newPassword: string) {
  return request<{ status: string }>("/api/admin/change-password", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ---- Admin Categories ----

export function adminGetCategories(token: string) {
  return request<Category[]>("/api/admin/categories", { headers: authHeaders(token) });
}

export function adminCreateCategory(token: string, name: string) {
  return request<Category>("/api/admin/categories", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
}

export function adminSaveCategories(token: string, categories: Category[]) {
  return request<Category[]>("/api/admin/categories", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(categories),
  });
}

export function adminDeleteCategory(token: string, id: string) {
  return request<{ status: string }>("/api/admin/categories", {
    method: "DELETE",
    headers: authHeaders(token),
    body: JSON.stringify({ id }),
  });
}

export function adminReorderProducts(token: string, ids: string[]) {
  return request<{ status: string }>("/api/admin/reorder", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  });
}

export { ApiError };
