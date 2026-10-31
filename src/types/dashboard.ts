export interface MetricItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  comparisonText: string;
  iconName: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  mrr: number;
  newCustomers: number;
}

export type TransactionStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  plan: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod: string;
}

export type ActivityType = 'new_subscription' | 'upgrade' | 'downgrade' | 'payment_failed' | 'cancellation' | 'invoice_paid';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  amount?: string;
  user: {
    name: string;
    initials: string;
  };
}

export interface PlanDistribution {
  name: string;
  subscriptionsCount: number;
  percentage: number;
  monthlyValue: string;
  color: string;
}

