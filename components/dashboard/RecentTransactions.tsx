'use client';

import { useFinance } from '@/lib/store/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecentTransactions() {
  const { state } = useFinance();

  const recent = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-semibold text-sm">Giao dịch gần đây</h2>
          <p className="text-slate-500 text-xs mt-0.5">8 giao dịch mới nhất</p>
        </div>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {recent.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}20` }}
            >
              {t.type === 'income' ? (
                <TrendingUp className="w-4 h-4" style={{ color: CATEGORY_COLORS[t.category] }} />
              ) : (
                <TrendingDown className="w-4 h-4" style={{ color: CATEGORY_COLORS[t.category] }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">
                {t.note || t.category}
              </p>
              <p className="text-slate-600 text-[10px]">
                {t.category} · {formatDate(t.date)}
              </p>
            </div>
            <p
              className={`text-xs font-semibold shrink-0 ${
                t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
