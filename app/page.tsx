'use client';

import { useFinance } from '@/lib/store/FinanceContext';
import { formatCurrency, getLastNMonths, getMonthLabel, isSameMonth } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

// Custom tooltip for BarChart
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-3 shadow-2xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs font-semibold">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for PieChart
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl p-3 shadow-2xl">
        <p className="text-slate-300 text-xs font-semibold">{payload[0].name}</p>
        <p className="text-slate-400 text-xs">{formatCurrency(payload[0].value)}</p>
        <p className="text-slate-500 text-xs">{(payload[0].percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { state, totalIncome, totalExpense, currentBalance, currentMonthIncome, currentMonthExpense } = useFinance();

  // Build bar chart data (last 6 months)
  const last6Months = getLastNMonths(6);
  const barData = last6Months.map((month) => {
    const income = state.transactions
      .filter((t) => t.type === 'income' && isSameMonth(t.date, month))
      .reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions
      .filter((t) => t.type === 'expense' && isSameMonth(t.date, month))
      .reduce((s, t) => s + t.amount, 0);
    return { month: getMonthLabel(month), income, expense };
  });

  // Build pie chart data (expense by category, current month)
  const now = new Date();
  const expenseByCategory: Record<string, number> = {};
  state.transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
  const pieData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Active debts
  const activeDebts = state.debts.filter((d) => d.status === 'Đang nợ');
  const totalDebt = activeDebts.reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  const isPositive = currentBalance >= 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan tài chính cá nhân của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <div className={`rounded-2xl p-5 border ${isPositive ? 'bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border-indigo-700/30' : 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-700/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Số dư hiện tại</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-indigo-500/20' : 'bg-red-500/20'}`}>
              <Wallet className={`w-4 h-4 ${isPositive ? 'text-indigo-400' : 'text-red-400'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isPositive ? 'text-indigo-300' : 'text-red-400'}`}>
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-slate-600 text-xs mt-1">Tổng thu - Tổng chi</p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Thu tháng này</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{formatCurrency(currentMonthIncome)}</p>
          <p className="text-slate-600 text-xs mt-1">Tháng {now.getMonth() + 1}/{now.getFullYear()}</p>
        </div>

        {/* Monthly Expense */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-900/40 to-rose-800/20 border border-rose-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Chi tháng này</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/20">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-300">{formatCurrency(currentMonthExpense)}</p>
          <p className="text-slate-600 text-xs mt-1">Tháng {now.getMonth() + 1}/{now.getFullYear()}</p>
        </div>

        {/* Debts */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-700/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Còn nợ</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-300">{formatCurrency(totalDebt)}</p>
          <p className="text-slate-600 text-xs mt-1">{activeDebts.length} khoản đang nợ</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-[#1a1f2e] rounded-2xl border border-slate-800 p-6">
          <div className="mb-5">
            <h2 className="text-white font-semibold text-sm">Thu nhập vs Chi tiêu</h2>
            <p className="text-slate-500 text-xs mt-0.5">So sánh 6 tháng gần nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Bar dataKey="income" name="Thu nhập" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-2 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">Thu nhập</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-slate-500">Chi tiêu</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-6">
          <div className="mb-4">
            <h2 className="text-white font-semibold text-sm">Chi tiêu theo danh mục</h2>
            <p className="text-slate-500 text-xs mt-0.5">Tháng {now.getMonth() + 1}/{now.getFullYear()}</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Chưa có dữ liệu tháng này
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.slice(0, 5).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#64748b' }}
                      />
                      <span className="text-xs text-slate-400 truncate">{entry.name}</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium shrink-0 ml-2">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
