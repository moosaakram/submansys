import { MetricItem, RevenueDataPoint, Transaction, ActivityItem, PlanDistribution } from '@/types/dashboard';

export const METRICS_DATA: MetricItem[] = [
  {
    id: 'total_customers',
    title: 'Total Customers',
    value: '12,482',
    change: '+14.2%',
    isPositive: true,
    comparisonText: 'vs. previous 30 days',
    iconName: 'Users',
  },
  {
    id: 'active_subscriptions',
    title: 'Active Subscriptions',
    value: '8,924',
    change: '+8.1%',
    isPositive: true,
    comparisonText: 'vs. previous 30 days',
    iconName: 'Repeat',
  },
  {
    id: 'monthly_recurring_revenue',
    title: 'Monthly Recurring Revenue',
    value: '₹128,450',
    change: '+18.5%',
    isPositive: true,
    comparisonText: '+₹20,120 from last month',
    iconName: 'TrendingUp',
  },
  {
    id: 'pending_payments',
    title: 'Pending Payments',
    value: '₹4,280',
    change: '-3.2%',
    isPositive: false,
    comparisonText: '18 invoices awaiting settlement',
    iconName: 'AlertCircle',
  },
];

export const REVENUE_CHART_DATA: RevenueDataPoint[] = [
  { month: 'Nov', revenue: 78500, expenses: 22000, mrr: 72000, newCustomers: 340 },
  { month: 'Dec', revenue: 84200, expenses: 23500, mrr: 77500, newCustomers: 410 },
  { month: 'Jan', revenue: 89000, expenses: 24000, mrr: 83000, newCustomers: 450 },
  { month: 'Feb', revenue: 92400, expenses: 25100, mrr: 86900, newCustomers: 490 },
  { month: 'Mar', revenue: 99800, expenses: 26400, mrr: 93200, newCustomers: 560 },
  { month: 'Apr', revenue: 104500, expenses: 27800, mrr: 98100, newCustomers: 580 },
  { month: 'May', revenue: 109200, expenses: 28200, mrr: 102500, newCustomers: 620 },
  { month: 'Jun', revenue: 115600, expenses: 29500, mrr: 108400, newCustomers: 680 },
  { month: 'Jul', revenue: 120400, expenses: 31000, mrr: 114000, newCustomers: 710 },
  { month: 'Aug', revenue: 122800, expenses: 31500, mrr: 118200, newCustomers: 740 },
  { month: 'Sep', revenue: 125100, expenses: 32000, mrr: 121500, newCustomers: 780 },
  { month: 'Oct', revenue: 128450, expenses: 33100, mrr: 128450, newCustomers: 840 },
];

export const TRANSACTIONS_DATA: Transaction[] = [
  {
    id: 'tx-001',
    invoiceNumber: 'INV-2026-0091',
    customer: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@acmetech.io',
    },
    plan: 'Enterprise Cloud Suite',
    amount: 1499.00,
    date: 'Oct 31, 2026',
    status: 'paid',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'tx-002',
    invoiceNumber: 'INV-2026-0090',
    customer: {
      name: 'David Alvarez',
      email: 'd.alvarez@orbitflow.co',
    },
    plan: 'Growth Pro Annual',
    amount: 589.00,
    date: 'Oct 30, 2026',
    status: 'paid',
    paymentMethod: 'Mastercard •••• 8821',
  },
  {
    id: 'tx-003',
    invoiceNumber: 'INV-2026-0089',
    customer: {
      name: 'Amara Okafor',
      email: 'amara@pulseanalytics.net',
    },
    plan: 'Scale Tier Plus',
    amount: 890.00,
    date: 'Oct 30, 2026',
    status: 'pending',
    paymentMethod: 'Bank Transfer (ACH)',
  },
  {
    id: 'tx-004',
    invoiceNumber: 'INV-2026-0088',
    customer: {
      name: 'Liam Chen',
      email: 'liam.chen@hyperleap.dev',
    },
    plan: 'Starter Team Seat',
    amount: 129.00,
    date: 'Oct 29, 2026',
    status: 'paid',
    paymentMethod: 'Amex •••• 1004',
  },
  {
    id: 'tx-005',
    invoiceNumber: 'INV-2026-0087',
    customer: {
      name: 'Elena Rostova',
      email: 'elena@novacrest.ai',
    },
    plan: 'Enterprise Custom',
    amount: 2450.00,
    date: 'Oct 28, 2026',
    status: 'failed',
    paymentMethod: 'Visa •••• 9312',
  },
  {
    id: 'tx-006',
    invoiceNumber: 'INV-2026-0086',
    customer: {
      name: 'Marcus Brody',
      email: 'marcus@vanguardops.com',
    },
    plan: 'Growth Pro Monthly',
    amount: 149.00,
    date: 'Oct 28, 2026',
    status: 'refunded',
    paymentMethod: 'PayPal',
  },
  {
    id: 'tx-007',
    invoiceNumber: 'INV-2026-0085',
    customer: {
      name: 'Sophia Lindqvist',
      email: 'sophia@nordicdesigns.se',
    },
    plan: 'Scale Tier Plus',
    amount: 890.00,
    date: 'Oct 27, 2026',
    status: 'paid',
    paymentMethod: 'Visa •••• 3145',
  },
];

export const ACTIVITY_DATA: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'new_subscription',
    title: 'New Enterprise Plan Subscribed',
    description: 'AcmeTech Corp onboarded 45 seats under Enterprise Tier.',
    timestamp: '12 minutes ago',
    amount: '+₹1,499/mo',
    user: { name: 'Sarah Jenkins', initials: 'SJ' },
  },
  {
    id: 'act-002',
    type: 'upgrade',
    title: 'Plan Upgraded to Pro',
    description: 'OrbitFlow upgraded from Starter to Growth Pro Annual.',
    timestamp: '48 minutes ago',
    amount: '+₹589.00',
    user: { name: 'David Alvarez', initials: 'DA' },
  },
  {
    id: 'act-003',
    type: 'payment_failed',
    title: 'Subscription Payment Retried',
    description: 'Card charge failed for NovaCrest AI (Insufficient funds). Auto-retry in 24h.',
    timestamp: '2 hours ago',
    amount: '₹2,450.00',
    user: { name: 'Elena Rostova', initials: 'ER' },
  },
  {
    id: 'act-004',
    type: 'invoice_paid',
    title: 'Automated Invoice Settled',
    description: 'Invoice #INV-2026-0085 marked as paid via Stripe webhook.',
    timestamp: '3 hours ago',
    amount: '+₹890.00',
    user: { name: 'Sophia Lindqvist', initials: 'SL' },
  },
  {
    id: 'act-005',
    type: 'cancellation',
    title: 'Subscription Cancelled',
    description: 'Customer requested cancellation at the end of billing cycle.',
    timestamp: '5 hours ago',
    user: { name: 'Marcus Brody', initials: 'MB' },
  },
];

export const PLAN_DISTRIBUTION_DATA: PlanDistribution[] = [
  {
    name: 'Enterprise Cloud',
    subscriptionsCount: 1420,
    percentage: 42,
    monthlyValue: '₹68,200',
    color: '#4f46e5', // indigo-600
  },
  {
    name: 'Growth Pro',
    subscriptionsCount: 3890,
    percentage: 36,
    monthlyValue: '₹42,500',
    color: '#0ea5e9', // sky-500
  },
  {
    name: 'Scale Plus',
    subscriptionsCount: 2214,
    percentage: 15,
    monthlyValue: '₹14,850',
    color: '#6366f1', // indigo-500
  },
  {
    name: 'Starter Basic',
    subscriptionsCount: 1400,
    percentage: 7,
    monthlyValue: '₹2,900',
    color: '#94a3b8', // slate-400
  },
];

export const NOTIFICATIONS_DATA = [
  {
    id: 'notif-1',
    title: 'High MRR Milestone Reached',
    description: 'Monthly Recurring Revenue surpassed ₹125k this week!',
    time: '10m ago',
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'Dunning alert: 2 failed payments',
    description: 'Automated email sequence sent to affected accounts.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'Tax invoice report ready',
    description: 'Monthly financial summary for October has been compiled.',
    time: '4h ago',
    unread: false,
  },
];

