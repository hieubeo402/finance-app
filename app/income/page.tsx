'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/store/FinanceContext';
import { INCOME_CATEGORIES, Transaction } from '@/lib/types';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';
import { Plus, Trash2, TrendingUp } from 'lucide-react';

export default function IncomePage() {
  const { state, dispatch, currentMonthIncome, totalIncome } = useFinance();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    category: INCOME_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount.replace(/[^0-9]/g, ''));
    if (!amt || amt <= 0) return;

    const tx: Transaction = {
      id: generateId(),
      type: 'income',
      amount: amt,
      category: form.category,
      date: new Date(form.date).toISOString(),
      note: form.note,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    setForm({ amount: '', category: INCOME_CATEGORIES[0], date: new Date().toISOString().split('T')[0], note: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa khoản thu nhập này?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  const incomes = state.transactions
    .filter((t) => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thu nhập</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các khoản thu nhập của bạn</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          id="add-income-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm thu nhập
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Thu tháng này</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(currentMonthIncome)}</p>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Tổng thu nhập</p>
          <p className="text-2xl font-bold text-emerald-300">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Số giao dịch</p>
          <p className="text-2xl font-bold text-slate-300">{incomes.length}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#1a1f2e] rounded-2xl border border-emerald-800/30 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Thêm khoản thu nhập mới
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Số tiền (VNĐ)</label>
              <input
                type="number"
                required
                min="1000"
                placeholder="Ví dụ: 18000000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Loại thu nhập</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ngày nhận</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ghi chú</label>
              <input
                type="text"
                placeholder="Mô tả khoản thu..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                Lưu thu nhập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Loại</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Ghi chú</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Ngày</th>
                <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Số tiền</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-600 text-sm py-12">
                    Chưa có khoản thu nhập nào
                  </td>
                </tr>
              ) : (
                incomes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#22c55e'}20` }}
                        >
                          <span style={{ color: CATEGORY_COLORS[t.category] || '#22c55e' }}>●</span>
                        </div>
                        <span className="text-slate-300 text-xs font-medium">{t.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">
                      {t.note || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-emerald-400 text-sm font-semibold whitespace-nowrap">
                      +{formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
