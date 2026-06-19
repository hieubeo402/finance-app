'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  FinanceState,
  FinanceAction,
  Transaction,
  Debt,
  DebtPayment,
} from '../types';
import { initialMockState } from '../mock-data';

const STORAGE_KEY = 'finance_app_data';

// ---- Reducer ----
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'ADD_DEBT':
      return {
        ...state,
        debts: [action.payload, ...state.debts],
      };

    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter((d) => d.id !== action.payload),
      };

    case 'RECORD_DEBT_PAYMENT': {
      const { debtId, payment } = action.payload;
      return {
        ...state,
        debts: state.debts.map((debt) => {
          if (debt.id !== debtId) return debt;
          const newPaid = debt.paidAmount + payment.amount;
          const newStatus = newPaid >= debt.totalAmount ? 'Đã trả xong' : 'Đang nợ';
          return {
            ...debt,
            paidAmount: Math.min(newPaid, debt.totalAmount),
            status: newStatus,
            payments: [...debt.payments, payment],
          };
        }),
      };
    }

    default:
      return state;
  }
}

// ---- Context ----
interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  // Computed helpers
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

// ---- Provider ----
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialMockState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FinanceState = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // Computed values
  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const now = new Date();
  const currentMonthIncome = state.transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = state.transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        state,
        dispatch,
        totalIncome,
        totalExpense,
        currentBalance,
        currentMonthIncome,
        currentMonthExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

// ---- Hook ----
export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
