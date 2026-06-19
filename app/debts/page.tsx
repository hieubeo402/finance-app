'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/store/FinanceContext';
import { Debt, DebtPayment } from '@/lib/types';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';
import { Plus, CreditCard, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// --- Progress Bar ---
function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// --- Debt Card ---
function DebtCard({ debt }: { debt: Debt }) {
  const { dispatch } = useFinance();
  const [showPayForm, setShowPayForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const remaining = debt.totalAmount - debt.paidAmount;
  const pct = (debt.paidAmount / debt.totalAmount) * 100;
  const isPaid = debt.status === 'Đã trả xong';

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount.replace(/[^0-9]/g, ''));
    if (!amt || amt <= 0 || amt > remaining) return;

    const payment: DebtPayment = {
      id: generateId(),
      amount: amt,
      date: new Date(payDate).toISOString(),
      note: payNote,
    };
    dispatch({ type: 'RECORD_DEBT_PAYMENT', payload: { debtId: debt.id, payment } });
    setPayAmount('');
    setPayNote('');
    setShowPayForm(false);
  };

  const handleDelete = () => {
    if (confirm(`Xóa khoản nợ với "${debt.creditorName}"?`)) {
      dispatch({ type: 'DELETE_DEBT', payload: debt.id });
    }
  };

  return (
    <div className={`bg-[#1a1f2e] rounded-2xl border p-5 transition-all duration-200 ${isPaid ? 'border-emerald-800/30' : 'border-slate-800'}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPaid ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
            {isPaid
              ? <CheckCircle className="w-5 h-5 text-emerald-400" />
              : <Clock className="w-5 h-5 text-amber-400" />
            }
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{debt.creditorName}</h3>
            <p className="text-slate-600 text-xs">{debt.note || 'Không có ghi chú'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {debt.status}
          </span>
          <button
            onClick={handleDelete}
            className="text-slate-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Tổng nợ</p>
          <p className="text-slate-300 text-sm font-bold">{formatCurrency(debt.totalAmount)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Đã trả</p>
          <p className="text-emerald-400 text-sm font-bold">{formatCurrency(debt.paidAmount)}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Còn lại</p>
          <p className={`text-sm font-bold ${isPaid ? 'text-slate-500' : 'text-rose-400'}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-1">
        <ProgressBar value={pct} />
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-600 text-[10px]">Đã trả {pct.toFixed(0)}%</span>
        <span className="text-slate-600 text-[10px]">Đáo hạn: {formatDate(debt.dueDate)}</span>
      </div>

      {/* Actions */}
      {!isPaid && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowPayForm((s) => !s)}
            className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium rounded-xl border border-indigo-700/30 transition-all"
          >
            Ghi nhận trả nợ
          </button>
        </div>
      )}

      {/* Payment Form */}
      {showPayForm && (
        <form onSubmit={handlePay} className="bg-slate-800/40 rounded-xl p-4 mb-3 space-y-3">
          <p className="text-slate-400 text-xs font-medium">Ghi nhận khoản trả</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-[10px] mb-1">Số tiền (tối đa {formatCurrency(remaining)})</label>
              <input
                type="number"
                required
                min="1000"
                max={remaining}
                placeholder="Số tiền trả..."
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[10px] mb-1">Ngày trả</label>
              <input
                type="date"
                required
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
                className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Ghi chú..."
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowPayForm(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5">Hủy</button>
            <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-all">Xác nhận</button>
          </div>
        </form>
      )}

      {/* Payment History */}
      {debt.payments.length > 0 && (
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-400 text-[10px] transition-colors"
        >
          {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Lịch sử trả nợ ({debt.payments.length} lần)
        </button>
      )}
      {showHistory && (
        <div className="mt-2 space-y-1.5">
          {debt.payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center px-3 py-2 bg-slate-800/40 rounded-lg">
              <div>
                <span className="text-slate-400 text-[10px]">{formatDate(p.date)}</span>
                {p.note && <span className="text-slate-600 text-[10px] ml-2">· {p.note}</span>}
              </div>
              <span className="text-emerald-400 text-[10px] font-semibold">+{formatCurrency(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === MAIN PAGE ===
export default function DebtsPage() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    creditorName: '',
    totalAmount: '',
    dueDate: '',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.totalAmount.replace(/[^0-9]/g, ''));
    if (!amt || amt <= 0 || !form.creditorName) return;

    const debt: Debt = {
      id: generateId(),
      creditorName: form.creditorName,
      totalAmount: amt,
      paidAmount: 0,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(),
      status: 'Đang nợ',
      note: form.note,
      createdAt: new Date().toISOString(),
      payments: [],
    };
    dispatch({ type: 'ADD_DEBT', payload: debt });
    setForm({ creditorName: '', totalAmount: '', dueDate: '', note: '' });
    setShowForm(false);
  };

  const activeDebts = state.debts.filter((d) => d.status === 'Đang nợ');
  const paidDebts = state.debts.filter((d) => d.status === 'Đã trả xong');
  const totalOwed = activeDebts.reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trả nợ</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý các khoản nợ của bạn</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          id="add-debt-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Tạo khoản nợ
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Tổng còn nợ</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Đang nợ</p>
          <p className="text-2xl font-bold text-rose-400">{activeDebts.length} khoản</p>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl border border-slate-800 p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Đã trả xong</p>
          <p className="text-2xl font-bold text-emerald-400">{paidDebts.length} khoản</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#1a1f2e] rounded-2xl border border-indigo-800/30 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Tạo khoản nợ mới
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Tên chủ nợ / người cho vay</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Ngân hàng Vietcombank"
                value={form.creditorName}
                onChange={(e) => setForm({ ...form, creditorName: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Tổng số tiền nợ (VNĐ)</label>
              <input
                type="number"
                required
                min="1000"
                placeholder="Ví dụ: 50000000"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ngày đáo hạn</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium">Ghi chú</label>
              <input
                type="text"
                placeholder="Mục đích vay..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Hủy</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all">Tạo khoản nợ</button>
            </div>
          </form>
        </div>
      )}

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div>
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Đang nợ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDebts.map((d) => <DebtCard key={d.id} debt={d} />)}
          </div>
        </div>
      )}

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <div>
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Đã trả xong</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paidDebts.map((d) => <DebtCard key={d.id} debt={d} />)}
          </div>
        </div>
      )}

      {state.debts.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có khoản nợ nào</p>
        </div>
      )}
    </div>
  );
}
