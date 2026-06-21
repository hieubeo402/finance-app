'use client';

import { useState, useMemo } from 'react';
import { useFinance } from '@/lib/store/FinanceContext';
import { Budget, BUDGET_CATEGORIES } from '@/lib/types';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target, ChevronLeft, ChevronRight } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

function progressColor(pct: number) {
  if (pct > 100) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#10b981';
}

export default function BudgetsPage() {
  const { state, dispatch } = useFinance();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');

  // Navigate months
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Get budgets for selected month/year
  const monthBudgets = useMemo(
    () => state.budgets.filter((b) => b.month === month && b.year === year),
    [state.budgets, month, year]
  );

  // Calculate spending per category for selected month/year
  const spending = useMemo(() => {
    const map: Record<string, number> = {};
    state.transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return;
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return map;
  }, [state.transactions, month, year]);

  const getBudget = (cat: string) => monthBudgets.find((b) => b.category === cat);

  // Summary
  const totalLimit = monthBudgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = BUDGET_CATEGORIES.reduce((s, c) => s + (spending[c.key] ?? 0), 0);
  const totalRemaining = Math.max(totalLimit - totalSpent, 0);

  // Radar data
  const radarData = BUDGET_CATEGORIES.map((c) => {
    const budget = getBudget(c.key);
    const spent = spending[c.key] ?? 0;
    const limit = budget?.monthlyLimit ?? 0;
    return {
      category: c.icon + ' ' + c.key,
      Chi: spent,
      HạnMức: limit,
    };
  });

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCategory || !limitInput) return;
    const existing = getBudget(modalCategory);
    const budget: Budget = {
      id: existing?.id ?? crypto.randomUUID(),
      category: modalCategory,
      monthlyLimit: Math.round(parseFloat(limitInput)),
      month,
      year,
    };
    dispatch({ type: 'UPSERT_BUDGET', payload: budget });
    setModalCategory(null);
    setLimitInput('');
  };

  const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ngân sách</h1>
          <p className="text-sm text-slate-500 mt-0.5">Đặt hạn mức chi tiêu theo tháng</p>
        </div>
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-[#1a1f2e] border border-slate-800 rounded-xl px-3 py-2">
          <button id="prev-month-btn" onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <span className="text-sm font-semibold text-white min-w-[120px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button id="next-month-btn" onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Tổng hạn mức', value: fmt(totalLimit), color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'from-indigo-500/10 to-indigo-600/5' },
          { label: 'Đã chi', value: fmt(totalSpent), color: 'text-amber-400', border: 'border-amber-500/20', bg: 'from-amber-500/10 to-amber-600/5' },
          { label: 'Còn lại', value: fmt(totalRemaining), color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'from-emerald-500/10 to-emerald-600/5' },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-3 md:p-5`}>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-sm md:text-xl font-bold mt-1 ${s.color} break-all`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-[#1a1f2e] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 mb-4">Biểu đồ radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 9, fill: '#64748b' }}
              />
              <Radar name="Chi tiêu" dataKey="Chi" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Radar name="Hạn mức" dataKey="HạnMức" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Tooltip
                formatter={(v: unknown) => [fmt(Number(v)), '']}
                contentStyle={{ background: '#1a1f2e', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0', fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUDGET_CATEGORIES.map((cat) => {
            const budget = getBudget(cat.key);
            const spent = spending[cat.key] ?? 0;
            const limit = budget?.monthlyLimit ?? 0;
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 120) : 0;
            const barColor = progressColor(pct);
            const hasOver = pct > 100;

            return (
              <div
                key={cat.key}
                className={`bg-[#1a1f2e] border rounded-2xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors ${hasOver ? 'border-rose-500/40' : 'border-slate-800'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <p className="text-xs font-semibold text-slate-300 truncate">{cat.key}</p>
                </div>

                {limit > 0 ? (
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span style={{ color: barColor }} className="font-semibold">{fmt(spent)}</span>
                      <span className="text-slate-600">{fmt(limit)}</span>
                    </div>
                    {hasOver && (
                      <p className="text-[10px] text-rose-400 font-medium">Vượt {fmt(spent - limit)}!</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-800 rounded-full h-1.5" />
                    <p className="text-[10px] text-slate-600">Chi: {fmt(spent)}</p>
                    <p className="text-[10px] text-slate-600">Chưa đặt hạn mức</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setModalCategory(cat.key);
                    setLimitInput(limit > 0 ? limit.toString() : '');
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20 transition-colors"
                >
                  <Target className="w-3 h-3" />
                  Đặt hạn mức
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Budget Modal */}
      {modalCategory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalCategory(null)} />
          <div className="relative bg-[#1a1f2e] border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 shadow-2xl">
            {(() => {
              const cat = BUDGET_CATEGORIES.find((c) => c.key === modalCategory);
              return (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{cat?.icon}</span>
                    <div>
                      <h2 className="text-lg font-bold text-white">{modalCategory}</h2>
                      <p className="text-xs text-slate-500">{MONTH_NAMES[month - 1]} {year}</p>
                    </div>
                  </div>
                  <form onSubmit={handleSetBudget} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">Hạn mức chi tiêu (đ) *</label>
                      <input
                        id="budget-limit"
                        type="number"
                        required
                        min="1"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={() => setModalCategory(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Hủy</button>
                      <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30">Lưu</button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
