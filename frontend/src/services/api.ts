/**
 * Brightloop 360 / SubManSys API Client Service
 * Connects Frontend directly to FastAPI Backend and Database.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

let authToken: string | null = null;

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('subman_auth_token');
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('subman_auth_token', token);
    } else {
      localStorage.removeItem('subman_auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('subman_auth_token');
  }
  return authToken;
}

/**
 * Universal fetch wrapper with authorization, JSON parsing, and graceful error handling.
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    let body: any = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        (typeof body === 'object' && body?.message) ||
        (typeof body === 'object' && body?.detail) ||
        res.statusText ||
        'Request failed';
      return { data: null, error: String(errorMsg), status: res.status };
    }

    return { data: body as T, error: null, status: res.status };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Network connection failed',
      status: 0,
    };
  }
}

// -----------------------------------------------------------------------------
// Health & Diagnostic Endpoints
// -----------------------------------------------------------------------------

export interface BackendHealth {
  online: boolean;
  project: string;
  version: string;
  database: string;
  url: string;
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  const { data, error } = await apiRequest<{
    project?: string;
    version?: string;
    status?: string;
  }>('/');

  if (!error && data) {
    return {
      online: true,
      project: data.project || 'Brightloop 360',
      version: data.version || '1.0.0',
      database: 'Connected',
      url: API_BASE,
    };
  }

  return {
    online: false,
    project: 'Brightloop 360',
    version: '1.0.0',
    database: 'Offline',
    url: API_BASE,
  };
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------

export async function apiLogin(email: string, password: string) {
  const res = await apiRequest<{
    access_token: string;
    token_type: string;
    user: any;
  }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.data?.access_token) {
    setAuthToken(res.data.access_token);
  }

  return res;
}

export async function apiSignup(data: {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
  company_name?: string;
}) {
  const res = await apiRequest<{
    access_token: string;
    token_type: string;
    user: any;
  }>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (res.data?.access_token) {
    setAuthToken(res.data.access_token);
  }

  return res;
}

/**
 * Ensures an active authentication token exists for local testing calls.
 * If not signed in, logs in using default local Admin credentials.
 */
export async function ensureDefaultToken(): Promise<boolean> {
  if (getAuthToken()) return true;
  const res = await apiLogin('admin@brightloop.com', 'Admin@12345!');
  return !!res.data?.access_token;
}

// -----------------------------------------------------------------------------
// Products & Variants
// -----------------------------------------------------------------------------

export async function apiGetProducts() {
  return apiRequest<any[]>('/api/v1/products/');
}

export async function apiCreateProduct(payload: {
  name: string;
  description?: string;
  product_type?: string;
  sales_price: number;
  cost_price: number;
  variants?: { attribute_name: string; attribute_value: string; price_extra: number }[];
}) {
  await ensureDefaultToken();
  return apiRequest<any>('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -----------------------------------------------------------------------------
// Plans
// -----------------------------------------------------------------------------

export async function apiGetPlans() {
  return apiRequest<any[]>('/api/v1/plans/');
}

export async function apiCreatePlan(payload: {
  name: string;
  description?: string;
  cost: number;
  billing_cycle: string;
  minimum_quantity: number;
  auto_close?: boolean;
  allow_early_close?: boolean;
  allow_pause?: boolean;
  allow_renew?: boolean;
}) {
  await ensureDefaultToken();
  return apiRequest<any>('/api/v1/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -----------------------------------------------------------------------------
// Subscriptions
// -----------------------------------------------------------------------------

export async function apiGetSubscriptions() {
  await ensureDefaultToken();
  return apiRequest<any[]>('/api/v1/subscriptions');
}

export async function apiCreateSubscription(payload: any) {
  await ensureDefaultToken();
  return apiRequest<any>('/api/v1/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiSubscriptionAction(id: string, action: 'confirm' | 'activate' | 'pause' | 'resume' | 'cancel' | 'renew') {
  await ensureDefaultToken();
  return apiRequest<any>(`/api/v1/subscriptions/${id}/${action}`, {
    method: 'POST',
  });
}

// -----------------------------------------------------------------------------
// Invoices & Billing Day
// -----------------------------------------------------------------------------

export async function apiGetInvoices() {
  await ensureDefaultToken();
  return apiRequest<any[]>('/api/v1/invoices');
}

export async function apiRunBillingDay() {
  await ensureDefaultToken();
  return apiRequest<{
    status: string;
    message: string;
    invoices_generated: number;
    generated_invoices: any[];
  }>('/api/v1/invoices/run-billing-day', {
    method: 'POST',
  });
}

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------

export async function apiGetPayments() {
  await ensureDefaultToken();
  return apiRequest<any[]>('/api/v1/payments');
}

export async function apiRecordPayment(payload: {
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  note?: string;
}) {
  await ensureDefaultToken();
  return apiRequest<any>('/api/v1/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -----------------------------------------------------------------------------
// Analytics
// -----------------------------------------------------------------------------

export async function apiGetAnalyticsSummary() {
  await ensureDefaultToken();
  return apiRequest<any>('/api/v1/analytics/summary');
}

// -----------------------------------------------------------------------------
// Taxes & Discounts
// -----------------------------------------------------------------------------

export async function apiGetTaxes() {
  return apiRequest<any[]>('/api/v1/taxes/');
}

export async function apiGetDiscounts() {
  return apiRequest<any[]>('/api/v1/discounts/');
}
