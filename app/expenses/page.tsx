'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/store/FinanceContext';
import { EXPENSE_CATEGORIES, Transaction } from '@/lib/types';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';
import { Plus, Trash2, TrendingDown, Search } from 'lucide-react';

export default function ExpensesPage() {
  const { state, dispatch, currentMonthExpense } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Form state
  const [form, setForm] = useState({
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount.replace(/[^0-9]/g, ''));
    if (!amt || amt <= 0) return;

    const tx: Transaction = {
      id: generateId(),
      type: 'expense',
      amount: amt,
      category: form.category,
      date: new Date(form.date).toISOString(),
      note: form.note,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    setForm({ amount: '', category: EXPENSE_CATEGORIES[0], date: new Date().toISOString().split('T')[0], note: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa giao dịch này?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  // Filter
  const expenses = state.transactions
    .filter((t) => t.type === 'expense')
    .filter((t) => {
      if (filterMonth === 'all') return true;
      const [y, m] = filterMonth.split('-');
      const d = new Date(t.date);
      return d.getFullYear() === parseInt(y) && d.getMonth() + 1 === parseInt(m);
    })
    .filter((t) =>
      searchText === '' ||
      t.category.toLowerCase().includes(searchText.toLowerCase()) ||
      t.note.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Month options
  const months = Array.from(
    new Set(state.transactions.filter((t) => t.type === 'expense').map((t) => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }))
  ).sort().reverse();

  const totalFiltered = expenses.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chi tiêu</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các khoản chi tiêu hàng ngày</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          id="add-expense-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm chi tiêu
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Chi tiêu tháng này</p>
          <p className="text-2xl font-bold text-rose-400">{formatCurrency(currentMonthExpense)}</p>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Đang hiển thị</p>
          <p className="text-2xl font-bold text-slate-300">{formatCurrency(totalFiltered)}</p>
          <p className="text-slate-600 text-xs mt-1">{expenses.length} giao dịch</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#1a1f2e] rounded-2xl border border-rose-800/30 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Thêm khoản chi tiêu mới
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Số tiền (VNĐ)</label>
              <input
                type="number"
                required
                min="1000"
                placeholder="Ví dụ: 500000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ngày</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ghi chú</label>
              <input
                type="text"
                placeholder="Mô tả khoản chi..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 transition-colors"
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                Lưu chi tiêu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo danh mục, ghi chú..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-slate-800 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-600 transition-colors"
          />
        </div>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="bg-[#1a1f2e] border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-slate-600 transition-colors"
        >
          <option value="all">Tất cả tháng</option>
          {months.map((m) => {
            const [y, mo] = m.split('-');
            return <option key={m} value={m}>Tháng {mo}/{y}</option>;
          })}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Danh mục</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Ghi chú</th>
                <th className="text-left text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Ngày</th>
                <th className="text-right text-slate-500 text-xs font-medium uppercase tracking-wider px-5 py-4">Số tiền</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-600 text-sm py-12">
                    Không có khoản chi tiêu nào
                  </td>
                </tr>
              ) : (
                expenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                          style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#64748b'}20` }}
                        >
                          <span style={{ color: CATEGORY_COLORS[t.category] || '#64748b' }}>●</span>
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
                    <td className="px-5 py-3.5 text-right text-rose-400 text-sm font-semibold whitespace-nowrap">
                      -{formatCurrency(t.amount)}
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
