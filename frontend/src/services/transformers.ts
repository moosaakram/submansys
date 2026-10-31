import {
  Product,
  Plan,
  Subscription,
  Invoice,
  Payment,
  TaxRule,
  DiscountRule,
} from '@/types/subscription';

export function mapBackendProduct(bp: any): Product {
  return {
    id: String(bp.id),
    name: bp.name,
    productType: (bp.product_type === 'recurring' ? 'software' : bp.product_type === 'add_on' ? 'addon' : 'service') as any,
    salesPrice: Number(bp.sales_price || 0),
    costPrice: Number(bp.cost_price || 0),
    description: bp.description || '',
    notes: bp.notes || '',
    isActive: Boolean(bp.is_active ?? true),
    createdAt: bp.created_at ? String(bp.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
    variants: (bp.variants || []).map((v: any) => ({
      id: String(v.id),
      name: `${v.attribute_value} (${v.attribute_name})`,
      attribute: v.attribute_name,
      priceDelta: Number(v.price_extra || 0),
      sku: v.sku || '',
    })),
  };
}

export function mapBackendPlan(bplan: any): Plan {
  return {
    id: String(bplan.id),
    name: bplan.name,
    description: bplan.description || '',
    basePrice: Number(bplan.cost || 0),
    billingCycle: (bplan.billing_cycle?.toLowerCase() || 'monthly') as any,
    minQuantity: Number(bplan.minimum_quantity || 1),
    startDate: bplan.start_date ? String(bplan.start_date).split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: bplan.end_date ? String(bplan.end_date).split('T')[0] : undefined,
    autoCloseOnExpiry: Boolean(bplan.auto_close),
    allowEarlyClosure: Boolean(bplan.allow_early_close ?? true),
    allowPause: Boolean(bplan.allow_pause ?? true),
    allowRenewal: Boolean(bplan.allow_renew ?? true),
    isActive: Boolean(bplan.is_active ?? true),
  };
}

export function mapBackendSubscription(bsub: any): Subscription {
  return {
    id: String(bsub.id),
    subscriptionNumber: bsub.subscription_number,
    customerId: String(bsub.customer_id),
    customerName: bsub.customer?.full_name || 'Customer',
    customerEmail: bsub.customer?.email || 'customer@example.com',
    planId: String(bsub.plan_id || ''),
    planName: bsub.plan?.name || 'Standard Plan',
    billingCycle: (bsub.billing_cycle?.toLowerCase() || 'monthly') as any,
    status: (bsub.status?.toLowerCase() || 'draft') as any,
    startDate: bsub.start_date ? String(bsub.start_date).split('T')[0] : new Date().toISOString().split('T')[0],
    expiryDate: bsub.expiry_date ? String(bsub.expiry_date).split('T')[0] : new Date().toISOString().split('T')[0],
    nextBillingDate: bsub.next_billing_date ? String(bsub.next_billing_date).split('T')[0] : new Date().toISOString().split('T')[0],
    lastBilledDate: bsub.last_billed_date ? String(bsub.last_billed_date).split('T')[0] : undefined,
    paymentTerms: bsub.payment_terms || 'Net 30',
    lines: (bsub.lines || []).map((line: any, idx: number) => ({
      id: String(line.id || `line-${idx}`),
      productId: String(line.product_id),
      productName: line.product_name || 'Product',
      variantId: line.variant_id ? String(line.variant_id) : undefined,
      variantName: line.variant_name,
      quantity: Number(line.quantity || 1),
      unitPrice: Number(line.unit_price || 0),
      taxRate: Number(line.tax_rate || 0),
      discountAmount: Number(line.discount_amount || 0),
      lineTotal: Number(line.amount || 0),
    })),
    subtotal: Number(bsub.unit_price || 0) * Number(bsub.quantity || 1),
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: Number(bsub.total_amount || 0),
    notes: bsub.notes || '',
    autoClose: Boolean(bsub.auto_close),
    isPaused: bsub.status === 'paused',
    createdAt: bsub.created_at ? String(bsub.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function mapBackendInvoice(binv: any): Invoice {
  return {
    id: String(binv.id),
    invoiceNumber: binv.invoice_number,
    subscriptionId: String(binv.subscription_id || ''),
    subscriptionNumber: binv.subscription?.subscription_number,
    customerId: String(binv.customer_id || ''),
    customerName: binv.customer_name || binv.customer?.full_name || 'Customer',
    customerEmail: binv.customer_email || binv.customer?.email || 'customer@example.com',
    issueDate: binv.issue_date ? String(binv.issue_date).split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: binv.due_date ? String(binv.due_date).split('T')[0] : new Date().toISOString().split('T')[0],
    status: (binv.status?.toLowerCase() || 'draft') as any,
    lines: (binv.lines || []).map((l: any, idx: number) => ({
      id: String(l.id || `inv-line-${idx}`),
      productId: String(l.product_id || ''),
      description: l.description || 'Service line',
      quantity: Number(l.quantity || 1),
      unitPrice: Number(l.unit_price || 0),
      taxRate: Number(l.tax_rate || 0),
      taxAmount: Number(l.tax_amount || 0),
      discountAmount: Number(l.discount_amount || 0),
      lineTotal: Number(l.amount || 0),
    })),
    subtotal: Number(binv.subtotal || 0),
    taxAmount: Number(binv.tax_amount || 0),
    discountAmount: Number(binv.discount_amount || 0),
    totalAmount: Number(binv.total_amount || 0),
    amountPaid: Number(binv.paid_amount || 0),
    notes: binv.notes || '',
    createdAt: binv.created_at ? String(binv.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function mapBackendTax(btax: any): TaxRule {
  return {
    id: String(btax.id),
    name: btax.name,
    rate: Number(btax.rate || 0),
    isDefault: false,
    description: btax.description,
  };
}

export function mapBackendDiscount(bdisc: any): DiscountRule {
  return {
    id: String(bdisc.id),
    name: bdisc.name,
    code: bdisc.code || '',
    type: bdisc.discount_type?.toLowerCase() === 'fixed_amount' ? 'fixed_amount' : 'percentage',
    value: Number(bdisc.value || 0),
    minQuantity: bdisc.min_quantity ? Number(bdisc.min_quantity) : undefined,
    minPurchaseAmount: bdisc.min_purchase_amount ? Number(bdisc.min_purchase_amount) : undefined,
    scope: (bdisc.scope?.toLowerCase() === 'specific_products' ? 'specific_product' : 'entire_subscription'),
    isActive: Boolean(bdisc.is_active ?? true),
    timesUsed: Number(bdisc.current_uses || 0),
    maxUsageCount: bdisc.max_uses ? Number(bdisc.max_uses) : 100,
    startDate: bdisc.start_date ? String(bdisc.start_date).split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: bdisc.end_date ? String(bdisc.end_date).split('T')[0] : undefined,
  };
}
