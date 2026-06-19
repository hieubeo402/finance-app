// ============================================================
// CORE TYPE DEFINITIONS
// ============================================================

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Lương'
  | 'Thưởng'
  | 'Lãi suất'
  | 'Đầu tư'
  | 'Freelance'
  | 'Khác';

export type ExpenseCategory =
  | 'Ăn uống'
  | 'Mua sắm'
  | 'Hóa đơn'
  | 'Giải trí'
  | 'Đi lại'
  | 'Y tế'
  | 'Giáo dục'
  | 'Du lịch'
  | 'Khác';

export type DebtStatus = 'Đang nợ' | 'Đã trả xong';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  date: string; // ISO string
  note: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  creditorName: string; // Tên chủ nợ / người vay
  totalAmount: number; // Tổng số tiền ban đầu
  paidAmount: number; // Đã trả
  dueDate: string; // Ngày đáo hạn (ISO string)
  status: DebtStatus;
  note: string;
  createdAt: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'RECORD_DEBT_PAYMENT'; payload: { debtId: string; payment: DebtPayment } }
  | { type: 'LOAD_STATE'; payload: FinanceState };

// ---- Helpers ----
export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Lương',
  'Thưởng',
  'Lãi suất',
  'Đầu tư',
  'Freelance',
  'Khác',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Ăn uống',
  'Mua sắm',
  'Hóa đơn',
  'Giải trí',
  'Đi lại',
  'Y tế',
  'Giáo dục',
  'Du lịch',
  'Khác',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#f97316',
  'Mua sắm': '#ec4899',
  'Hóa đơn': '#6366f1',
  'Giải trí': '#8b5cf6',
  'Đi lại': '#06b6d4',
  'Y tế': '#ef4444',
  'Giáo dục': '#3b82f6',
  'Du lịch': '#14b8a6',
  'Khác': '#64748b',
  'Lương': '#22c55e',
  'Thưởng': '#eab308',
  'Lãi suất': '#10b981',
  'Đầu tư': '#0ea5e9',
  'Freelance': '#a855f7',
};
