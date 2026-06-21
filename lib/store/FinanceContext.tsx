'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  FinanceState,
  FinanceAction,
  Transaction,
  Debt,
  DebtPayment,
  Loan,
  LoanPayment,
  Budget,
} from '../types';
import { createClient } from '../supabase/client';

// Empty initial state (data comes from Supabase)
const emptyState: FinanceState = { transactions: [], debts: [], loans: [], budgets: [] };

// ---- Reducer ----
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };

    case 'ADD_DEBT':
      return { ...state, debts: [action.payload, ...state.debts] };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter((d) => d.id !== action.payload) };
    case 'RECORD_DEBT_PAYMENT': {
      const { debtId, payment } = action.payload;
      return {
        ...state,
        debts: state.debts.map((debt) => {
          if (debt.id !== debtId) return debt;
          const newPaid = debt.paidAmount + payment.amount;
          return {
            ...debt,
            paidAmount: Math.min(newPaid, debt.totalAmount),
            status: newPaid >= debt.totalAmount ? 'Đã trả xong' : 'Đang nợ',
            payments: [...debt.payments, payment],
          };
        }),
      };
    }

    case 'ADD_LOAN':
      return { ...state, loans: [action.payload, ...state.loans] };
    case 'DELETE_LOAN':
      return { ...state, loans: state.loans.filter((l) => l.id !== action.payload) };
    case 'RECORD_LOAN_PAYMENT': {
      const { loanId, payment } = action.payload;
      return {
        ...state,
        loans: state.loans.map((loan) => {
          if (loan.id !== loanId) return loan;
          const newPaid = loan.paidAmount + payment.amount;
          const isPaidOff = newPaid >= loan.totalAmount;
          return {
            ...loan,
            paidAmount: Math.min(newPaid, loan.totalAmount),
            status: isPaidOff ? 'Đã thu hồi' : loan.status === 'Quá hạn' ? 'Quá hạn' : 'Đang vay',
            payments: [...loan.payments, payment],
          };
        }),
      };
    }

    case 'UPSERT_BUDGET': {
      const exists = state.budgets.some((b) => b.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          budgets: state.budgets.map((b) => (b.id === action.payload.id ? action.payload : b)),
        };
      }
      return { ...state, budgets: [...state.budgets, action.payload] };
    }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };

    default:
      return state;
  }
}

// ---- Context ----
interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  loading: boolean;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

// ---- Provider ----
export function FinanceProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [state, dispatch] = useReducer(financeReducer, emptyState);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load data from Supabase on mount
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);
      try {
        // Load transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        // Load debts with payments
        const { data: debtData } = await supabase
          .from('debts')
          .select('*, debt_payments(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // Load loans with payments
        const { data: loanData } = await supabase
          .from('loans')
          .select('*, loan_payments(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // Load budgets
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);

        const transactions: Transaction[] = (txData ?? []).map((r: any) => ({
          id: r.id,
          type: r.type,
          amount: r.amount,
          category: r.category,
          date: r.date,
          note: r.note ?? '',
          createdAt: r.created_at,
        }));

        const debts: Debt[] = (debtData ?? []).map((r: any) => ({
          id: r.id,
          creditorName: r.creditor_name,
          totalAmount: r.total_amount,
          paidAmount: r.paid_amount,
          dueDate: r.due_date ?? new Date().toISOString(),
          status: r.status,
          note: r.note ?? '',
          createdAt: r.created_at,
          payments: (r.debt_payments ?? []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.date,
            note: p.note ?? '',
          })),
        }));

        const loans: Loan[] = (loanData ?? []).map((r: any) => ({
          id: r.id,
          borrowerName: r.borrower_name,
          totalAmount: r.total_amount,
          paidAmount: r.paid_amount,
          loanDate: r.loan_date,
          dueDate: r.due_date ?? '',
          status: r.status,
          note: r.note ?? '',
          createdAt: r.created_at,
          payments: (r.loan_payments ?? []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.date,
            note: p.note ?? '',
          })),
        }));

        const budgets: Budget[] = (budgetData ?? []).map((r: any) => ({
          id: r.id,
          category: r.category,
          monthlyLimit: r.monthly_limit,
          month: r.month,
          year: r.year,
        }));

        dispatch({ type: 'LOAD_STATE', payload: { transactions, debts, loans, budgets } });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // ---- Supabase-backed dispatch ----
  const supabaseDispatch: React.Dispatch<FinanceAction> = async (action) => {
    // Optimistic UI update first
    dispatch(action);

    // Then sync to Supabase
    try {
      switch (action.type) {
        case 'ADD_TRANSACTION': {
          const t = action.payload as Transaction;
          await supabase.from('transactions').insert({
            id: t.id,
            user_id: userId,
            type: t.type,
            amount: t.amount,
            category: t.category,
            date: t.date,
            note: t.note,
          });
          break;
        }
        case 'DELETE_TRANSACTION': {
          await supabase.from('transactions').delete().eq('id', action.payload);
          break;
        }
        case 'ADD_DEBT': {
          const d = action.payload as Debt;
          await supabase.from('debts').insert({
            id: d.id,
            user_id: userId,
            creditor_name: d.creditorName,
            total_amount: d.totalAmount,
            paid_amount: 0,
            due_date: d.dueDate,
            status: d.status,
            note: d.note,
          });
          break;
        }
        case 'DELETE_DEBT': {
          await supabase.from('debts').delete().eq('id', action.payload);
          break;
        }
        case 'RECORD_DEBT_PAYMENT': {
          const { debtId, payment } = action.payload as { debtId: string; payment: DebtPayment };
          const debt = state.debts.find((d) => d.id === debtId);
          if (!debt) break;
          const newPaid = Math.min(debt.paidAmount + payment.amount, debt.totalAmount);
          const newStatus = newPaid >= debt.totalAmount ? 'Đã trả xong' : 'Đang nợ';

          await supabase.from('debt_payments').insert({
            id: payment.id,
            debt_id: debtId,
            amount: payment.amount,
            date: payment.date,
            note: payment.note,
          });
          await supabase.from('debts').update({
            paid_amount: newPaid,
            status: newStatus,
          }).eq('id', debtId);
          break;
        }

        case 'ADD_LOAN': {
          const l = action.payload as Loan;
          await supabase.from('loans').insert({
            id: l.id,
            user_id: userId,
            borrower_name: l.borrowerName,
            total_amount: l.totalAmount,
            paid_amount: 0,
            loan_date: l.loanDate,
            due_date: l.dueDate || null,
            status: l.status,
            note: l.note,
          });
          break;
        }
        case 'DELETE_LOAN': {
          await supabase.from('loans').delete().eq('id', action.payload);
          break;
        }
        case 'RECORD_LOAN_PAYMENT': {
          const { loanId, payment } = action.payload as { loanId: string; payment: LoanPayment };
          const loan = state.loans.find((l) => l.id === loanId);
          if (!loan) break;
          const newPaid = Math.min(loan.paidAmount + payment.amount, loan.totalAmount);
          const newStatus = newPaid >= loan.totalAmount ? 'Đã thu hồi' :
            loan.status === 'Quá hạn' ? 'Quá hạn' : 'Đang vay';

          await supabase.from('loan_payments').insert({
            id: payment.id,
            loan_id: loanId,
            amount: payment.amount,
            date: payment.date,
            note: payment.note,
          });
          await supabase.from('loans').update({
            paid_amount: newPaid,
            status: newStatus,
          }).eq('id', loanId);
          break;
        }

        case 'UPSERT_BUDGET': {
          const b = action.payload as Budget;
          await supabase.from('budgets').upsert({
            id: b.id,
            user_id: userId,
            category: b.category,
            monthly_limit: b.monthlyLimit,
            month: b.month,
            year: b.year,
          }, { onConflict: 'user_id,category,month,year' });
          break;
        }
        case 'DELETE_BUDGET': {
          await supabase.from('budgets').delete().eq('id', action.payload);
          break;
        }
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  };

  // Computed values
  const totalIncome = state.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;
  const now = new Date();
  const currentMonthIncome = state.transactions
    .filter((t) => t.type === 'income' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((s, t) => s + t.amount, 0);
  const currentMonthExpense = state.transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((s, t) => s + t.amount, 0);

  return (
    <FinanceContext.Provider value={{ state, dispatch: supabaseDispatch, loading, totalIncome, totalExpense, currentBalance, currentMonthIncome, currentMonthExpense }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
