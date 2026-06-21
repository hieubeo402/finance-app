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
  | 'Nhà ở'
  | 'Biếu bố mẹ'
  | 'Khác';

export type DebtStatus = 'Đang nợ' | 'Đã trả xong';
export type LoanStatus = 'Đang vay' | 'Đã thu hồi' | 'Quá hạn';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  date: string;
  note: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  creditorName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
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

// ---- Loans (cho vay) ----
export interface Loan {
  id: string;
  borrowerName: string;   // Tên người vay
  totalAmount: number;    // Tổng cho vay
  paidAmount: number;     // Đã trả lại
  loanDate: string;       // Ngày cho vay
  dueDate: string;        // Hạn trả
  status: LoanStatus;
  note: string;
  createdAt: string;
  payments: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  amount: number;
  date: string;
  note: string;
}

// ---- Budgets (mục tiêu chi tiêu) ----
export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
}

export interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
  loans: Loan[];
  budgets: Budget[];
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'RECORD_DEBT_PAYMENT'; payload: { debtId: string; payment: DebtPayment } }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'RECORD_LOAN_PAYMENT'; payload: { loanId: string; payment: LoanPayment } }
  | { type: 'UPSERT_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'LOAD_STATE'; payload: FinanceState };

// ---- Helpers ----
export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Lương', 'Thưởng', 'Lãi suất', 'Đầu tư', 'Freelance', 'Khác',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Ăn uống', 'Biếu bố mẹ', 'Mua sắm', 'Hóa đơn', 'Giải trí',
  'Đi lại', 'Y tế', 'Giáo dục', 'Du lịch', 'Nhà ở', 'Khác',
];

export const BUDGET_CATEGORIES = [
  { key: 'Ăn uống', icon: '🍜' },
  { key: 'Biếu bố mẹ', icon: '👨‍👩‍👧' },
  { key: 'Du lịch', icon: '✈️' },
  { key: 'Mua sắm', icon: '🛍️' },
  { key: 'Đi lại', icon: '🚗' },
  { key: 'Y tế', icon: '💊' },
  { key: 'Giáo dục', icon: '📚' },
  { key: 'Nhà ở', icon: '🏠' },
  { key: 'Giải trí', icon: '🎮' },
  { key: 'Hóa đơn', icon: '💡' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#f97316',
  'Biếu bố mẹ': '#ec4899',
  'Mua sắm': '#d946ef',
  'Hóa đơn': '#6366f1',
  'Giải trí': '#8b5cf6',
  'Đi lại': '#06b6d4',
  'Y tế': '#ef4444',
  'Giáo dục': '#3b82f6',
  'Du lịch': '#14b8a6',
  'Nhà ở': '#f59e0b',
  'Khác': '#64748b',
  'Lương': '#22c55e',
  'Thưởng': '#eab308',
  'Lãi suất': '#10b981',
  'Đầu tư': '#0ea5e9',
  'Freelance': '#a855f7',
};
