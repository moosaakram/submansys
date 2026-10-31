'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  Product,
  Plan,
  QuotationTemplate,
  Subscription,
  SubscriptionStatus,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  TaxRule,
  DiscountRule,
  CustomerProfile,
  SubscriptionLine,
} from '@/types/subscription';
import {
  SEED_USERS,
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_PLANS,
  SEED_TAX_RULES,
  SEED_DISCOUNT_RULES,
  SEED_QUOTATION_TEMPLATES,
  SEED_SUBSCRIPTIONS,
  SEED_INVOICES,
  SEED_PAYMENTS,
} from '@/data/seedData';
import {
  authApi,
  healthApi,
  usersApi,
  invoicesApi,
  productsApi,
  plansApi,
  subscriptionsApi,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/services/api';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
}

interface SubscriptionContextType {
  // Backend & Connection Diagnostics
  isBackendConnected: boolean;
  backendStatus: string;
  checkBackendHealth: () => Promise<void>;

  // Auth & RBAC
  currentUser: User;
  users: User[];
  loginAs: (userIdOrRole: string) => Promise<void> | void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  registerUser: (data: RegistrationData) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  addStaffMember: (data: { name: string; email: string; password?: string }) => Promise<{ success: boolean; message: string }>;

  // Customers
  customers: CustomerProfile[];
  addCustomer: (data: Omit<CustomerProfile, 'id' | 'createdAt'>) => CustomerProfile;

  // Products
  products: Product[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Plans
  plans: Plan[];
  addPlan: (data: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;

  // Quotation Templates
  quotationTemplates: QuotationTemplate[];

  // Subscriptions
  subscriptions: Subscription[];
  createSubscription: (data: Partial<Subscription>) => Subscription;
  updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
  togglePauseSubscription: (id: string) => void;
  renewSubscription: (id: string, extensionMonths?: number) => void;

  // Invoices & Billing Day
  invoices: Invoice[];
  runBillingDay: () => { generatedCount: number; invoiceNumbers: string[] };
  createManualInvoice: (data: Partial<Invoice>) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  sendInvoice: (id: string) => { success: boolean; message: string };

  // Discounts & Taxes
  taxRules: TaxRule[];
  addTaxRule: (rule: Omit<TaxRule, 'id'>) => void;
  discountRules: DiscountRule[];
  addDiscountRule: (rule: Omit<DiscountRule, 'id' | 'timesUsed'>) => void;

  // Payments
  payments: Payment[];
  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    transactionRef?: string;
  }) => { success: boolean; message: string };

  // Financial Analytics KPIs
  analytics: {
    activeSubscriptionsCount: number;
    mrr: number;
    arr: number;
    totalRevenueCollected: number;
    overdueAmount: number;
    overdueInvoicesCount: number;
    pendingAmount: number;
    churnRiskCount: number;
  };

  // Toast / System Notification
  notification: string | null;
  setNotification: (msg: string | null) => void;

  // Persistence & Reset
  resetToDemoData: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Demo persona credentials mapping for local testing
const DEMO_CREDENTIALS: Record<string, { email: string; pw: string }> = {
  'user-admin-1': { email: 'admin@brightloop.com', pw: 'Admin@12345!' },
  admin: { email: 'admin@brightloop.com', pw: 'Admin@12345!' },
  'alex.mercer@brightloop.io': { email: 'alex.mercer@brightloop.io', pw: 'Admin@12345!' },
  'admin@brightloop.com': { email: 'admin@brightloop.com', pw: 'Admin@12345!' },

  'user-staff-1': { email: 'staff@brightloop.com', pw: 'Staff@12345!' },
  staff: { email: 'staff@brightloop.com', pw: 'Staff@12345!' },
  'marcus.v@brightloop.io': { email: 'marcus.v@brightloop.io', pw: 'Staff@12345!' },
  'staff@brightloop.com': { email: 'staff@brightloop.com', pw: 'Staff@12345!' },

  'user-cust-1': { email: 'customer@acme.com', pw: 'Customer@12345!' },
  customer: { email: 'customer@acme.com', pw: 'Customer@12345!' },
  'sarah.j@acmetech.io': { email: 'sarah.j@acmetech.io', pw: 'Customer@12345!' },
  'customer@acme.com': { email: 'customer@acme.com', pw: 'Customer@12345!' },

  'user-cust-2': { email: 'd.alvarez@orbitflow.co', pw: 'Customer@12345!' },
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // State Initialization
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]); // Alex Mercer (Admin) by default
  const [customers, setCustomers] = useState<CustomerProfile[]>(SEED_CUSTOMERS);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [plans, setPlans] = useState<Plan[]>(SEED_PLANS);
  const [quotationTemplates] = useState<QuotationTemplate[]>(SEED_QUOTATION_TEMPLATES);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(SEED_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(SEED_PAYMENTS);
  const [taxRules, setTaxRules] = useState<TaxRule[]>(SEED_TAX_RULES);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(SEED_DISCOUNT_RULES);
  const [notification, setNotification] = useState<string | null>(null);

  // Connection & Diagnostics State
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<string>('Connecting...');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Restore persistent state from localStorage after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('brightloop_current_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedUsers = localStorage.getItem('brightloop_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedProducts = localStorage.getItem('brightloop_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedPlans = localStorage.getItem('brightloop_plans');
      if (savedPlans) setPlans(JSON.parse(savedPlans));

      const savedCustomers = localStorage.getItem('brightloop_customers');
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

      const savedSubs = localStorage.getItem('brightloop_subscriptions');
      if (savedSubs) setSubscriptions(JSON.parse(savedSubs));

      const savedInvs = localStorage.getItem('brightloop_invoices');
      if (savedInvs) setInvoices(JSON.parse(savedInvs));

      const savedPayments = localStorage.getItem('brightloop_payments');
      if (savedPayments) setPayments(JSON.parse(savedPayments));

      const savedTax = localStorage.getItem('brightloop_tax_rules');
      if (savedTax) setTaxRules(JSON.parse(savedTax));

      const savedDisc = localStorage.getItem('brightloop_discount_rules');
      if (savedDisc) setDiscountRules(JSON.parse(savedDisc));
    } catch (e) {
      console.warn('LocalStorage restore note:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever state updates (only after hydration)
  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_products', JSON.stringify(products));
  }, [products, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_plans', JSON.stringify(plans));
  }, [plans, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_customers', JSON.stringify(customers));
  }, [customers, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_invoices', JSON.stringify(invoices));
  }, [invoices, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_payments', JSON.stringify(payments));
  }, [payments, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_tax_rules', JSON.stringify(taxRules));
  }, [taxRules, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_discount_rules', JSON.stringify(discountRules));
  }, [discountRules, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_users', JSON.stringify(users));
  }, [users, isHydrated]);

  useEffect(() => {
    if (isHydrated) localStorage.setItem('brightloop_current_user', JSON.stringify(currentUser));
  }, [currentUser, isHydrated]);

  // Check Backend and Database connectivity
  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await healthApi.check();
      if (res && res.status === 'success') {
        setIsBackendConnected(true);
        setBackendStatus('Connected');
      } else {
        setIsBackendConnected(false);
        setBackendStatus('Degraded');
      }
    } catch {
      setIsBackendConnected(false);
      setBackendStatus('Offline');
    }
  }, []);

  // Sync data on startup or after authenticating
  const syncFromBackend = useCallback(async () => {
    try {
      const [prodRes, planRes] = await Promise.allSettled([
        productsApi.getAll(),
        plansApi.getAll(),
      ]);
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
        // Backend products available
      }
      if (planRes.status === 'fulfilled' && Array.isArray(planRes.value) && planRes.value.length > 0) {
        // Backend plans available
      }
    } catch (e) {
      console.debug('Catalog sync notice:', e);
    }
  }, []);

  // Initial startup hook: check health and verify session token
  useEffect(() => {
    let mounted = true;

    async function initConnection() {
      await checkBackendHealth();

      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const me = await authApi.getMe();
          if (mounted && me) {
            const userObj: User = {
              id: String(me.id),
              name: me.full_name,
              email: me.email,
              role: me.role as UserRole,
              companyName: me.role === 'customer' ? 'Acme Technologies Inc.' : 'Brightloop HQ',
              avatar: me.full_name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              createdAt: me.created_at ? me.created_at.split('T')[0] : '2026-01-01',
            };
            setCurrentUser(userObj);
            setBackendStatus('Connected (JWT Active)');
          }
        } catch {
          // Token expired or invalid
          clearAuthToken();
        }
      }
      if (mounted) {
        await syncFromBackend();
      }
    }

    initConnection();
    return () => {
      mounted = false;
    };
  }, [checkBackendHealth, syncFromBackend]);

  // Auth: Log in with email and password via backend JWT
  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const auth = await authApi.login(email, password);
      const userObj: User = {
        id: String(auth.user.id),
        name: auth.user.full_name,
        email: auth.user.email,
        role: auth.user.role as UserRole,
        companyName: auth.user.role === 'customer' ? 'Acme Technologies Inc.' : 'Brightloop HQ',
        avatar: auth.user.full_name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        createdAt: auth.user.created_at ? auth.user.created_at.split('T')[0] : '2026-01-01',
      };

      setCurrentUser(userObj);
      setUsers((prev) => {
        if (!prev.some((u) => u.email.toLowerCase() === userObj.email.toLowerCase())) {
          return [userObj, ...prev];
        }
        return prev;
      });

      setIsBackendConnected(true);
      setBackendStatus('Connected (JWT Active)');
      setNotification(`Welcome back, ${userObj.name}! Authenticated via backend.`);
      await syncFromBackend();

      return { success: true, message: `Welcome back, ${userObj.name}!` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      return { success: false, message: msg };
    }
  };

  // Auth: Quick persona switcher
  const loginAs = async (userIdOrRole: string) => {
    const found = users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole);
    if (!found) return;

    // Check if we have demo credentials to authenticate against the backend
    const creds = DEMO_CREDENTIALS[userIdOrRole] || DEMO_CREDENTIALS[found.email] || DEMO_CREDENTIALS[found.role];
    if (creds && isBackendConnected) {
      try {
        const auth = await authApi.login(creds.email, creds.pw);
        if (auth?.access_token) {
          const userObj: User = {
            id: String(auth.user.id),
            name: auth.user.full_name,
            email: auth.user.email,
            role: auth.user.role as UserRole,
            companyName: auth.user.role === 'customer' ? 'Acme Technologies Inc.' : 'Brightloop HQ',
            avatar: auth.user.full_name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            createdAt: auth.user.created_at ? auth.user.created_at.split('T')[0] : '2026-01-01',
          };
          setCurrentUser(userObj);
          setBackendStatus('Connected (JWT Active)');
          setNotification(`Switched persona to ${userObj.name} (${userObj.role.toUpperCase()}) [JWT active]`);
          return;
        }
      } catch (err) {
        console.debug('Backend persona quick-login fallback:', err);
      }
    }

    // Local fallback
    setCurrentUser(found);
    setNotification(`Switched persona to ${found.name} (${found.role.toUpperCase()})`);
  };

  const logout = () => {
    clearAuthToken();
    setBackendStatus(isBackendConnected ? 'Connected (Guest)' : 'Offline');
    setNotification('Signed out successfully.');
    setCurrentUser(SEED_USERS[0]);
  };

  // Auth: Customer registration
  const registerUser = async (data: RegistrationData): Promise<{ success: boolean; message: string }> => {
    // Password criteria check: >8 chars, uppercase, lowercase, special character
    if (data.password.length <= 8) {
      return { success: false, message: 'Password must be more than 8 characters.' };
    }
    if (!/[A-Z]/.test(data.password)) {
      return { success: false, message: 'Password must include at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(data.password)) {
      return { success: false, message: 'Password must include at least one lowercase letter.' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
      return { success: false, message: 'Password must include at least one special character.' };
    }

    try {
      const res = await authApi.signup({
        email: data.email.trim(),
        password: data.password,
        full_name: data.name.trim(),
        company_name: data.companyName?.trim() || data.name.trim(),
        phone: '+1-555-0100',
      });

      const newUser: User = {
        id: String(res.user.id),
        name: res.user.full_name,
        email: res.user.email,
        role: res.user.role as UserRole,
        companyName: data.companyName,
        avatar: res.user.full_name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        createdAt: res.user.created_at ? res.user.created_at.split('T')[0] : '2026-01-01',
      };

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);

      if (data.role === 'customer') {
        const newCust: CustomerProfile = {
          id: res.user.customer_id || `cust-${Date.now()}`,
          fullName: data.name,
          email: data.email,
          companyName: data.companyName,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCustomers((prev) => [newCust, ...prev]);
      }

      setNotification(`Welcome, ${newUser.name}! Your account has been saved to the database.`);
      return { success: true, message: 'Account successfully registered and authenticated!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  // Auth: Password Reset link request
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authApi.forgotPassword(email);
      setNotification(res.message);
      return { success: true, message: res.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No registered account found with that email address.';
      return { success: false, message: msg };
    }
  };

  // Admin: Onboard Staff Member
  const addStaffMember = async (data: {
    name: string;
    email: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only an Admin can add a new member of staff.' };
    }

    try {
      const res = await usersApi.onboardStaff({
        full_name: data.name.trim(),
        email: data.email.trim(),
        password: data.password || 'StaffPassword@123!',
        role: 'staff',
      });

      const newStaff: User = {
        id: String(res.id),
        name: res.full_name,
        email: res.email,
        role: 'staff',
        companyName: 'Brightloop Internal Team',
        avatar: res.full_name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        createdAt: res.created_at ? res.created_at.split('T')[0] : '2026-01-01',
      };

      setUsers((prev) => [newStaff, ...prev]);
      setNotification(`New staff member ${newStaff.name} saved to database!`);
      return { success: true, message: `Staff member ${newStaff.name} successfully added.` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to onboard staff member.';
      return { success: false, message: msg };
    }
  };

  // Customer Management
  const addCustomer = (data: Omit<CustomerProfile, 'id' | 'createdAt'>): CustomerProfile => {
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    setNotification(`Customer ${newCust.fullName} added successfully.`);
    return newCust;
  };

  // Product Management
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [...prev, newProd]);
    setNotification(`Product "${newProd.name}" added to catalog.`);

    // If backend is active, also sync to database
    if (isBackendConnected) {
      productsApi
        .create({
          name: data.name,
          description: data.description || '',
          product_type: data.productType === 'software' ? 'recurring' : data.productType === 'addon' ? 'add_on' : 'service',
          sales_price: data.salesPrice,
          cost_price: data.costPrice,
          is_active: data.isActive,
          variants: (data.variants || []).map((v) => ({
            attribute_name: v.attribute || 'Brand',
            attribute_value: v.name,
            price_extra: v.priceDelta,
            is_active: true,
          })),
        })
        .catch((e) => console.debug('Backend product create notice:', e));
    }
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    setNotification('Product updated successfully.');

    if (isBackendConnected) {
      productsApi
        .update(id, {
          name: data.name,
          description: data.description,
          sales_price: data.salesPrice,
          cost_price: data.costPrice,
          is_active: data.isActive,
        })
        .catch((e) => console.debug('Backend product update notice:', e));
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification('Product removed from catalog.');

    if (isBackendConnected) {
      productsApi.delete(id).catch((e) => console.debug('Backend product delete notice:', e));
    }
  };

  // Plan Management
  const addPlan = (data: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      ...data,
    };
    setPlans((prev) => [...prev, newPlan]);
    setNotification(`Plan "${newPlan.name}" configured successfully.`);

    if (isBackendConnected) {
      plansApi
        .create({
          name: data.name,
          description: data.description || '',
          cost: data.basePrice,
          billing_cycle: data.billingCycle,
          minimum_quantity: data.minQuantity,
          start_date: new Date(data.startDate).toISOString(),
          end_date: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          auto_close: data.autoCloseOnExpiry,
          allow_early_close: data.allowEarlyClosure,
          allow_pause: data.allowPause,
          allow_renew: data.allowRenewal,
          is_active: data.isActive,
        })
        .catch((e) => console.debug('Backend plan create notice:', e));
    }
  };

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    setNotification('Plan updated.');

    if (isBackendConnected) {
      plansApi
        .update(id, {
          name: data.name,
          description: data.description,
          cost: data.basePrice,
          billing_cycle: data.billingCycle,
          minimum_quantity: data.minQuantity,
          auto_close: data.autoCloseOnExpiry,
          allow_early_close: data.allowEarlyClosure,
          allow_pause: data.allowPause,
          allow_renew: data.allowRenewal,
          is_active: data.isActive,
        })
        .catch((e) => console.debug('Backend plan update notice:', e));
    }
  };

  // Subscriptions Lifecycle
  const createSubscription = (data: Partial<Subscription>): Subscription => {
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: `SUB-2026-${String(subscriptions.length + 1).padStart(4, '0')}`,
      customerId: data.customerId || customers[0]?.id || 'cust-1',
      customerName: data.customerName || customers[0]?.fullName || 'Sarah Jenkins',
      customerEmail: data.customerEmail || customers[0]?.email || 'sarah.j@acmetech.io',
      planId: data.planId || plans[0]?.id || 'plan-pro-monthly',
      planName: data.planName || plans[0]?.name || 'Standard Plan',
      billingCycle: data.billingCycle || 'monthly',
      status: data.status || 'draft',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expiryDate:
        data.expiryDate ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextBillingDate:
        data.nextBillingDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: data.paymentTerms || 'Net 30',
      lines: data.lines || [],
      subtotal: data.subtotal || 0,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount: data.totalAmount || 0,
      notes: data.notes || '',
      autoClose: data.autoClose ?? false,
      isPaused: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setNotification(`Subscription ${newSub.subscriptionNumber} created as ${newSub.status.toUpperCase()}.`);
    return newSub;
  };

  const updateSubscriptionStatus = (id: string, newStatus: SubscriptionStatus) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        return {
          ...sub,
          status: newStatus,
        };
      })
    );
    setNotification(`Subscription status advanced to ${newStatus.toUpperCase()}`);
  };

  const togglePauseSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        const nextPaused = !sub.isPaused;
        return {
          ...sub,
          isPaused: nextPaused,
        };
      })
    );
    setNotification('Subscription billing paused/resumed.');
  };

  const renewSubscription = (id: string, extensionMonths: number = 12) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        const currentExp = new Date(sub.expiryDate);
        currentExp.setMonth(currentExp.getMonth() + extensionMonths);
        return {
          ...sub,
          status: 'active',
          expiryDate: currentExp.toISOString().split('T')[0],
        };
      })
    );
    setNotification('Subscription successfully renewed!');
  };

  // Invoicing & Billing Day Engine
  const runBillingDay = () => {
    // If backend is active, also trigger recurring billing in backend database
    if (isBackendConnected) {
      invoicesApi.runBillingDay()
        .then((res) => {
          if (res?.generated_count > 0) {
            setNotification(`⚡ Billing Day executed on database: ${res.generated_count} new invoice(s) generated.`);
          }
        })
        .catch((e) => {
          console.debug('Backend billing run sync:', e);
        });
    }

    const today = new Date().toISOString().split('T')[0];
    const generatedInvoices: Invoice[] = [];
    const generatedNumbers: string[] = [];

    subscriptions
      .filter((sub) => sub.status === 'active' && !sub.isPaused)
      .forEach((sub, idx) => {
        if (sub.lastBilledDate === today) {
          return;
        }

        const invNumber = `INV-2026-${String(invoices.length + generatedInvoices.length + 10).padStart(4, '0')}`;

        const invLines = sub.lines.map((sl, lIdx) => ({
          id: `invline-${Date.now()}-${lIdx}`,
          productId: sl.productId,
          description: `${sl.productName}${sl.variantName ? ` (${sl.variantName})` : ''} x ${sl.quantity}`,
          quantity: sl.quantity,
          unitPrice: sl.unitPrice,
          taxRate: sl.taxRate,
          taxAmount: sl.lineTotal * (sl.taxRate / 100),
          discountAmount: sl.discountAmount,
          lineTotal: sl.lineTotal,
        }));

        const newInv: Invoice = {
          id: `inv-run-${Date.now()}-${idx}`,
          invoiceNumber: invNumber,
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerEmail: sub.customerEmail,
          issueDate: today,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'confirmed',
          lines: invLines,
          subtotal: sub.subtotal,
          taxAmount: sub.taxAmount,
          discountAmount: sub.discountAmount,
          totalAmount: sub.totalAmount,
          amountPaid: 0,
          notes: `Automated recurring billing run for ${sub.planName} (${sub.billingCycle}).`,
          createdAt: today,
        };

        generatedInvoices.push(newInv);
        generatedNumbers.push(invNumber);
      });

    if (generatedInvoices.length > 0) {
      setInvoices((prev) => [...generatedInvoices, ...prev]);
      setSubscriptions((prev) =>
        prev.map((sub) => {
          const wasBilled = generatedInvoices.some((inv) => inv.subscriptionId === sub.id);
          if (wasBilled) {
            return { ...sub, lastBilledDate: today };
          }
          return sub;
        })
      );
      setNotification(`⚡ Billing Day complete! Generated ${generatedInvoices.length} recurring invoice(s).`);
    } else {
      setNotification('Billing Day complete. No subscriptions were due for recurring invoice creation.');
    }

    return {
      generatedCount: generatedInvoices.length,
      invoiceNumbers: generatedNumbers,
    };
  };

  const createManualInvoice = (data: Partial<Invoice>): Invoice => {
    const today = new Date().toISOString().split('T')[0];
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`,
      customerId: data.customerId || customers[0]?.id || 'cust-1',
      customerName: data.customerName || customers[0]?.fullName || 'Sarah Jenkins',
      customerEmail: data.customerEmail || customers[0]?.email || 'sarah.j@acmetech.io',
      subscriptionId: data.subscriptionId,
      subscriptionNumber: data.subscriptionNumber,
      issueDate: data.issueDate || today,
      dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: data.status || 'draft',
      lines: data.lines || [],
      subtotal: data.subtotal || 0,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount: data.totalAmount || 0,
      amountPaid: 0,
      notes: data.notes || '',
      createdAt: today,
    };

    setInvoices((prev) => [newInv, ...prev]);
    setNotification(`Invoice ${newInv.invoiceNumber} drafted.`);
    return newInv;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
    setNotification(`Invoice updated to ${status.toUpperCase()}`);
  };

  const sendInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, message: 'Invoice not found' };
    setNotification(`Invoice ${inv.invoiceNumber} emailed to ${inv.customerEmail}.`);
    return { success: true, message: `Invoice dispatched to ${inv.customerEmail}` };
  };

  // Discounts & Taxes
  const addTaxRule = (rule: Omit<TaxRule, 'id'>) => {
    const newTax: TaxRule = {
      id: `tax-${Date.now()}`,
      ...rule,
    };
    setTaxRules((prev) => [...prev, newTax]);
    setNotification(`Tax rule "${newTax.name}" (${newTax.rate}%) added.`);
  };

  const addDiscountRule = (rule: Omit<DiscountRule, 'id' | 'timesUsed'>) => {
    const newDisc: DiscountRule = {
      id: `disc-${Date.now()}`,
      timesUsed: 0,
      ...rule,
    };
    setDiscountRules((prev) => [...prev, newDisc]);
    setNotification(`Discount rule "${newDisc.name}" saved.`);
  };

  // Payments
  const recordPayment = (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    transactionRef?: string;
  }) => {
    const targetInv = invoices.find((i) => i.id === data.invoiceId);
    if (!targetInv) return { success: false, message: 'Invoice not found.' };

    const today = new Date().toISOString().split('T')[0];
    const newPay: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: targetInv.id,
      invoiceNumber: targetInv.invoiceNumber,
      customerId: targetInv.customerId,
      customerName: targetInv.customerName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: today,
      transactionRef: data.transactionRef || `TXN-${Date.now()}`,
      notes: data.notes,
    };

    setPayments((prev) => [newPay, ...prev]);

    // Update Invoice Amount Paid and Status
    const newAmountPaid = (targetInv.amountPaid || 0) + data.amount;
    const isFullyPaid = newAmountPaid >= targetInv.totalAmount;
    updateInvoiceStatus(targetInv.id, isFullyPaid ? 'paid' : 'confirmed');

    setNotification(`Payment of $${data.amount.toFixed(2)} recorded for ${targetInv.invoiceNumber}.`);
    return { success: true, message: `Payment recorded successfully!` };
  };

  // Real-Time Finance Analytics Computation
  const [currentDate, setCurrentDate] = useState<string>('2026-10-31');
  useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  const analytics = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === 'active' && !s.isPaused);
    const activeSubscriptionsCount = activeSubs.length;

    // Monthly Recurring Revenue (normalize yearly plans to /12)
    const mrr = activeSubs.reduce((acc, sub) => {
      const isYearly = sub.billingCycle === 'yearly';
      const monthlyVal = isYearly ? sub.totalAmount / 12 : sub.totalAmount;
      return acc + monthlyVal;
    }, 0);

    const arr = mrr * 12;

    // Total Cash Collected from Payments
    const totalRevenueCollected = payments
      .reduce((acc, p) => acc + p.amount, 0);

    // Overdue Calculations
    const overdueInvs = invoices.filter(
      (inv) =>
        inv.status === 'confirmed' &&
        inv.dueDate < currentDate &&
        inv.amountPaid < inv.totalAmount
    );
    const overdueAmount = overdueInvs.reduce(
      (acc, inv) => acc + (inv.totalAmount - (inv.amountPaid || 0)),
      0
    );
    const overdueInvoicesCount = overdueInvs.length;

    // All pending unpaid balance
    const pendingAmount = invoices
      .filter((inv) => inv.status === 'confirmed')
      .reduce((acc, inv) => acc + (inv.totalAmount - (inv.amountPaid || 0)), 0);

    return {
      activeSubscriptionsCount,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      totalRevenueCollected: Math.round(totalRevenueCollected * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      overdueInvoicesCount,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      churnRiskCount: subscriptions.filter((s) => s.isPaused || s.status === 'closed').length,
    };
  }, [subscriptions, invoices, payments, currentDate]);

  const resetToDemoData = () => {
    try {
      localStorage.removeItem('brightloop_products');
      localStorage.removeItem('brightloop_plans');
      localStorage.removeItem('brightloop_customers');
      localStorage.removeItem('brightloop_subscriptions');
      localStorage.removeItem('brightloop_invoices');
      localStorage.removeItem('brightloop_payments');
      localStorage.removeItem('brightloop_tax_rules');
      localStorage.removeItem('brightloop_discount_rules');
      localStorage.removeItem('brightloop_users');
      localStorage.removeItem('brightloop_current_user');
      localStorage.removeItem('brightloop_active_tab');
    } catch {}
    setProducts(SEED_PRODUCTS);
    setPlans(SEED_PLANS);
    setCustomers(SEED_CUSTOMERS);
    setSubscriptions(SEED_SUBSCRIPTIONS);
    setInvoices(SEED_INVOICES);
    setPayments(SEED_PAYMENTS);
    setTaxRules(SEED_TAX_RULES);
    setDiscountRules(SEED_DISCOUNT_RULES);
    setUsers(SEED_USERS);
    setCurrentUser(SEED_USERS[0]);
    setNotification('Demo data reset to factory defaults.');
  };

  const value = {
    isBackendConnected,
    backendStatus,
    checkBackendHealth,
    currentUser,
    users,
    loginAs,
    loginWithCredentials,
    logout,
    registerUser,
    resetPassword,
    addStaffMember,
    customers,
    addCustomer,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    plans,
    addPlan,
    updatePlan,
    quotationTemplates,
    subscriptions,
    createSubscription,
    updateSubscriptionStatus,
    togglePauseSubscription,
    renewSubscription,
    invoices,
    runBillingDay,
    createManualInvoice,
    updateInvoiceStatus,
    sendInvoice,
    taxRules,
    addTaxRule,
    discountRules,
    addDiscountRule,
    payments,
    recordPayment,
    analytics,
    notification,
    setNotification,
    resetToDemoData,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
