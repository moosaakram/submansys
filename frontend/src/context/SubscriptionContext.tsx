'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
}

interface SubscriptionContextType {
  // Auth & RBAC
  currentUser: User;
  users: User[];
  loginAs: (userIdOrRole: string) => void;
  authenticateUser: (email: string, password: string) => Promise<{ success: boolean; user?: User; message: string }>;
  registerUser: (data: RegistrationData) => { success: boolean; message: string };
  resetPassword: (email: string) => { success: boolean; message: string };
  addStaffMember: (data: { name: string; email: string }) => { success: boolean; message: string };
  
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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  // State Initialization with Seed Data
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

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auth & RBAC Handlers
  const loginAs = (userIdOrRole: string) => {
    const found = users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole);
    if (found) {
      setCurrentUser(found);
      setNotification(`Switched persona to ${found.name} (${found.role.toUpperCase()})`);
    }
  };

  const registerUser = (data: RegistrationData) => {
    // Check email uniqueness
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Password validation per Scene 1:
    // > 8 characters, uppercase, lowercase, special character
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

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      companyName: data.companyName,
      avatar: data.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    if (data.role === 'customer') {
      const newCust: CustomerProfile = {
        id: `cust-${Date.now()}`,
        fullName: data.name,
        email: data.email,
        companyName: data.companyName,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [...prev, newCust]);
    }

    setNotification(`Welcome, ${newUser.name}! Your ${newUser.role} account has been created.`);
    return { success: true, message: 'Account successfully registered!' };
  };

  const resetPassword = (email: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'No registered account found with that email address.' };
    }
    setNotification(`A password reset link has been dispatched to ${email}.`);
    return { success: true, message: `Password reset link sent to ${email}!` };
  };

  const addStaffMember = (data: { name: string; email: string }) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only an Admin can add a new member of staff.' };
    }
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'A team member with this email already exists.' };
    }

    const newStaff: User = {
      id: `staff-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'staff',
      companyName: 'Brightloop Internal Team',
      avatar: data.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newStaff]);
    setNotification(`New staff member ${newStaff.name} successfully invited!`);
    return { success: true, message: `Staff member ${newStaff.name} added.` };
  };

  // Customer Management
  const addCustomer = (data: Omit<CustomerProfile, 'id' | 'createdAt'>): CustomerProfile => {
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  // Product Operations
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    setNotification(`Product "${newProd.name}" added to catalog.`);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    setNotification('Product updated.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setNotification('Product removed from catalog.');
  };

  // Plan Operations
  const addPlan = (data: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      ...data,
    };
    setPlans((prev) => [newPlan, ...prev]);
    setNotification(`Plan "${newPlan.name}" launched successfully.`);
  };

  const updatePlan = (id: string, data: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    setNotification('Plan configuration updated.');
  };

  // Subscriptions & Lifecycle State Machine
  const createSubscription = (data: Partial<Subscription>): Subscription => {
    const subNumber = `SUB-2026-${String(subscriptions.length + 1).padStart(4, '0')}`;
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: subNumber,
      customerId: data.customerId || customers[0]?.id || 'cust-1',
      customerName: data.customerName || customers[0]?.fullName || 'Customer',
      customerEmail: data.customerEmail || customers[0]?.email || 'cust@example.com',
      planId: data.planId || plans[0]?.id || 'plan-monthly',
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
    const today = new Date().toISOString().split('T')[0];
    const generatedInvoices: Invoice[] = [];
    const generatedNumbers: string[] = [];

    // Filter active subscriptions that are due or have not been billed today
    subscriptions
      .filter((sub) => sub.status === 'active' && !sub.isPaused)
      .forEach((sub, idx) => {
        // Prevent duplicate billing if already billed on this date
        if (sub.lastBilledDate === today) {
          return;
        }

        const invNumber = `INV-2026-${String(invoices.length + generatedInvoices.length + 10).padStart(4, '0')}`;
        
        // Map subscription lines to invoice lines
        const invLines = sub.lines.map((sl, lIdx) => ({
          id: `invline-${Date.now()}-${lIdx}`,
          productId: sl.productId,
          description: `${sl.productName}${sl.variantName ? ` (${sl.variantName})` : ''} x ${sl.quantity}`,
          quantity: sl.quantity,
          unitPrice: sl.unitPrice,
          taxRate: sl.taxRate,
          taxAmount: (sl.lineTotal * (sl.taxRate / 100)),
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
      
      // Update subscription lastBilledDate to prevent duplicate billing
      const generatedSubIds = new Set(generatedInvoices.map((i) => i.subscriptionId));
      setSubscriptions((prev) =>
        prev.map((sub) =>
          generatedSubIds.has(sub.id) ? { ...sub, lastBilledDate: today } : sub
        )
      );

      setNotification(`Billing Day complete: ${generatedInvoices.length} invoices generated successfully!`);
    } else {
      setNotification('Billing Day checked: No pending subscriptions due for invoicing.');
    }

    return {
      generatedCount: generatedInvoices.length,
      invoiceNumbers: generatedNumbers,
    };
  };

  const createManualInvoice = (data: Partial<Invoice>): Invoice => {
    const invNumber = `INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      customerId: data.customerId || customers[0]?.id || 'cust-1',
      customerName: data.customerName || customers[0]?.fullName || 'Customer',
      customerEmail: data.customerEmail || customers[0]?.email || 'cust@example.com',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate:
        data.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: data.status || 'draft',
      lines: data.lines || [],
      subtotal: data.subtotal || 0,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount: data.totalAmount || 0,
      amountPaid: 0,
      notes: data.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setInvoices((prev) => [newInv, ...prev]);
    setNotification(`Invoice ${newInv.invoiceNumber} created as ${newInv.status.toUpperCase()}.`);
    return newInv;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    setNotification(`Invoice status set to ${status.toUpperCase()}.`);
  };

  const sendInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return { success: false, message: 'Invoice not found.' };
    setNotification(`Invoice ${inv.invoiceNumber} emailed to ${inv.customerEmail}.`);
    return { success: true, message: `Invoice sent to ${inv.customerEmail}!` };
  };

  // Discounts & Tax Rules
  const addTaxRule = (rule: Omit<TaxRule, 'id'>) => {
    const newRule: TaxRule = {
      id: `tax-${Date.now()}`,
      ...rule,
    };
    setTaxRules((prev) => [...prev, newRule]);
    setNotification(`Tax rule "${newRule.name}" created.`);
  };

  const addDiscountRule = (rule: Omit<DiscountRule, 'id' | 'timesUsed'>) => {
    if (currentUser.role !== 'admin') {
      setNotification('Unauthorized: Only Admin can create discount rules.');
      return;
    }
    const newRule: DiscountRule = {
      id: `disc-${Date.now()}`,
      ...rule,
      timesUsed: 0,
    };
    setDiscountRules((prev) => [newRule, ...prev]);
    setNotification(`Discount code "${newRule.code}" is now active.`);
  };

  // Payment Recording & Reconciliation
  const recordPayment = (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    transactionRef?: string;
  }) => {
    const inv = invoices.find((i) => i.id === data.invoiceId);
    if (!inv) {
      return { success: false, message: 'Invoice not found.' };
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: data.transactionRef || `TX-${Date.now().toString().slice(-6)}`,
      notes: data.notes || '',
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update invoice amountPaid and status
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== data.invoiceId) return i;
        const updatedPaid = (i.amountPaid || 0) + data.amount;
        const isFullyPaid = updatedPaid >= i.totalAmount - 0.01;
        return {
          ...i,
          amountPaid: updatedPaid,
          status: isFullyPaid ? 'paid' : i.status,
          paymentMethod: data.paymentMethod,
          paymentDate: newPayment.paymentDate,
        };
      })
    );

    setNotification(`Payment of $${data.amount.toFixed(2)} recorded for ${inv.invoiceNumber}.`);
    return { success: true, message: 'Payment successfully recorded!' };
  };

  const [currentDate, setCurrentDate] = useState<string>('2026-10-31');

  useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Financial Analytics Computation
  const analytics = useMemo(() => {
    const today = currentDate;

    // Active subscriptions count
    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const activeSubscriptionsCount = activeSubs.length;

    // Monthly Recurring Revenue (MRR) normalized
    let calculatedMRR = 0;
    activeSubs.forEach((sub) => {
      const amount = sub.totalAmount;
      if (sub.billingCycle === 'monthly') calculatedMRR += amount;
      else if (sub.billingCycle === 'yearly') calculatedMRR += amount / 12;
      else if (sub.billingCycle === 'weekly') calculatedMRR += amount * 4.33;
      else if (sub.billingCycle === 'daily') calculatedMRR += amount * 30;
    });

    const mrr = Math.round(calculatedMRR * 100) / 100;
    const arr = Math.round(mrr * 12 * 100) / 100;

    // Total payments recorded
    const totalRevenueCollected = payments.reduce((acc, p) => acc + p.amount, 0);

    // Overdue invoices: status is confirmed, unpaid, and due date < today
    const overdueInvs = invoices.filter(
      (inv) =>
        inv.status === 'confirmed' &&
        inv.amountPaid < inv.totalAmount &&
        inv.dueDate < today
    );
    const overdueAmount = overdueInvs.reduce(
      (acc, inv) => acc + (inv.totalAmount - inv.amountPaid),
      0
    );
    const overdueInvoicesCount = overdueInvs.length;

    // All pending unpaid balance
    const pendingAmount = invoices
      .filter((inv) => inv.status === 'confirmed')
      .reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);

    return {
      activeSubscriptionsCount,
      mrr,
      arr,
      totalRevenueCollected: Math.round(totalRevenueCollected * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      overdueInvoicesCount,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      churnRiskCount: subscriptions.filter((s) => s.isPaused || s.status === 'closed').length,
    };
  }, [subscriptions, invoices, payments, currentDate]);

  const value = {
    currentUser,
    users,
    loginAs,
    authenticateUser,
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
