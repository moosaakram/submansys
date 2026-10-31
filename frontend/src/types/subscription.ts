export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatar?: string;
  createdAt: string;
}

export type ProductType = 'software' | 'addon' | 'service';

export interface ProductVariant {
  id: string;
  name: string;
  attribute: string; // e.g. "Brand", "Tier"
  priceDelta: number; // e.g. +560 for Odoo Brand
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  productType: ProductType;
  salesPrice: number;
  costPrice: number;
  description?: string;
  notes?: string;
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
}

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: BillingCycle;
  minQuantity: number;
  startDate: string;
  endDate?: string;
  autoCloseOnExpiry: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  isActive: boolean;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  defaultPlanId: string;
  validityDays: number;
  defaultLines: {
    productId: string;
    variantId?: string;
    quantity: number;
    discountPercent?: number;
  }[];
}

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 10 for 10%
  discountAmount: number;
  lineTotal: number;
}

export type SubscriptionStatus = 'draft' | 'quotation' | 'confirmed' | 'active' | 'closed';

export interface Subscription {
  id: string;
  subscriptionNumber: string; // e.g. "SUB-2026-0001"
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  paymentTerms: string; // e.g. "Net 15", "Net 30", "Due on Receipt"
  lines: SubscriptionLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  isPaused?: boolean;
  autoClose: boolean;
  lastBilledDate?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export interface InvoiceLine {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0042"
  subscriptionId?: string;
  subscriptionNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'ach' | 'cash';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  transactionRef: string;
  notes?: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // percentage, e.g. 10.0 for 10%
  isDefault: boolean;
  description?: string;
}

export type DiscountType = 'percentage' | 'fixed_amount';
export type DiscountScope = 'entire_subscription' | 'specific_product';

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // e.g. 15 for 15% or 50 for ₹50
  minPurchaseAmount?: number;
  minQuantity?: number;
  startDate: string;
  endDate?: string;
  maxUsageCount: number;
  timesUsed: number;
  scope: DiscountScope;
  applicableProductIds?: string[];
  isActive: boolean;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

