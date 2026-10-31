/**
 * Brightloop 360 - Frontend API Client & Authentication Layer
 * Seamlessly connects the Next.js frontend to the FastAPI backend and database.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'brightloop_auth_token';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg =
      (typeof body === 'object' && body !== null && (body.message || body.detail)) ||
      `Request failed with status ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// Health & Diagnostic API
// ---------------------------------------------------------------------------
export const healthApi = {
  check: async () => {
    return request<{ status: string; message: string }>('/health');
  },
  rootInfo: async () => {
    return request<{ project: string; version: string; status: string }>('/');
  },
};

// ---------------------------------------------------------------------------
// Authentication API
// ---------------------------------------------------------------------------
export interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  customer_id?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  signup: async (params: {
    email: string;
    password: string;
    full_name: string;
    company_name?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const data = await request<AuthResponse>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  getMe: async (): Promise<BackendUser> => {
    return request<BackendUser>('/api/v1/auth/me');
  },

  forgotPassword: async (email: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  },

  logout: () => {
    clearAuthToken();
  },
};

// ---------------------------------------------------------------------------
// Users & Staff Management API
// ---------------------------------------------------------------------------
export const usersApi = {
  getAll: async () => {
    return request<BackendUser[]>('/api/v1/users');
  },
  onboardStaff: async (data: {
    email: string;
    full_name: string;
    password: string;
    role?: string;
  }) => {
    return request<BackendUser>('/api/v1/users/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ---------------------------------------------------------------------------
// Catalog Products API
// ---------------------------------------------------------------------------
export const productsApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/products/');
  },
  create: async (data: {
    name: string;
    description?: string;
    product_type?: string;
    sales_price: number;
    cost_price?: number;
    is_active?: boolean;
    variants?: Array<{
      attribute_name: string;
      attribute_value: string;
      price_extra: number;
      is_active?: boolean;
    }>;
  }) => {
    return request<any>('/api/v1/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/api/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return request<any>(`/api/v1/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---------------------------------------------------------------------------
// Subscription Plans API
// ---------------------------------------------------------------------------
export const plansApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/plans/');
  },
  create: async (data: any) => {
    return request<any>('/api/v1/plans/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any) => {
    return request<any>(`/api/v1/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ---------------------------------------------------------------------------
// Subscriptions API
// ---------------------------------------------------------------------------
export const subscriptionsApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/subscriptions/');
  },
  create: async (data: any) => {
    return request<any>('/api/v1/subscriptions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  pause: async (id: string) => {
    return request<any>(`/api/v1/subscriptions/${id}/pause`, { method: 'POST' });
  },
  resume: async (id: string) => {
    return request<any>(`/api/v1/subscriptions/${id}/resume`, { method: 'POST' });
  },
  renew: async (id: string, extensionMonths: number = 1) => {
    return request<any>(`/api/v1/subscriptions/${id}/renew?extension_months=${extensionMonths}`, {
      method: 'POST',
    });
  },
  close: async (id: string) => {
    return request<any>(`/api/v1/subscriptions/${id}/close`, { method: 'POST' });
  },
  updateStatus: async (id: string, status: string) => {
    return request<any>(`/api/v1/subscriptions/${id}/status?new_status=${status}`, {
      method: 'PUT',
    });
  },
};

// ---------------------------------------------------------------------------
// Invoices & Recurring Billing Day API
// ---------------------------------------------------------------------------
export const invoicesApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/invoices/');
  },
  create: async (data: any) => {
    return request<any>('/api/v1/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  runBillingDay: async () => {
    return request<{
      status: string;
      message: string;
      generated_count: number;
      invoice_ids: string[];
    }>('/api/v1/invoices/generate-recurring', {
      method: 'POST',
    });
  },
  updateStatus: async (id: string, status: string) => {
    return request<any>(`/api/v1/invoices/${id}/status?new_status=${status}`, {
      method: 'PUT',
    });
  },
};

// ---------------------------------------------------------------------------
// Payments API
// ---------------------------------------------------------------------------
export const paymentsApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/payments/');
  },
  record: async (data: {
    invoice_id: string;
    payment_method: string;
    amount: number;
    note?: string;
  }) => {
    return request<any>('/api/v1/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ---------------------------------------------------------------------------
// Discounts & Taxes API
// ---------------------------------------------------------------------------
export const discountsApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/discounts/');
  },
  create: async (data: any) => {
    return request<any>('/api/v1/discounts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const taxesApi = {
  getAll: async () => {
    return request<any[]>('/api/v1/taxes/');
  },
  create: async (data: any) => {
    return request<any>('/api/v1/taxes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ---------------------------------------------------------------------------
// Real-Time Analytics API
// ---------------------------------------------------------------------------
export const analyticsApi = {
  getDashboard: async () => {
    return request<{
      active_subscriptions_count: number;
      total_revenue_collected: number;
      total_outstanding_owed: number;
      overdue_invoices_count: number;
      churn_rate_percent: number;
      query_execution_time_ms: number;
    }>('/api/v1/analytics/dashboard');
  },
};

