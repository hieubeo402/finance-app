'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/store/FinanceContext';
import { Loan, LoanPayment } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

function statusColor(status: string) {
  if (status === 'Đã thu hồi') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (status === 'Quá hạn') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'Đã thu hồi') return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === 'Quá hạn') return <AlertCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

interface AddLoanForm {
  borrowerName: string;
  totalAmount: string;
  loanDate: string;
  dueDate: string;
  note: string;
}

interface PaymentForm {
  amount: string;
  date: string;
  note: string;
}

export default function LoansPage() {
  const { state, dispatch } = useFinance();
  const loans = state.loans;

  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);

  const [addForm, setAddForm] = useState<AddLoanForm>({
    borrowerName: '',
    totalAmount: '',
    loanDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    note: '',
  });

  const [payForm, setPayForm] = useState<PaymentForm>({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  });

  // Summary stats
  const totalLent = loans.reduce((s, l) => s + l.totalAmount, 0);
  const totalRecovered = loans.reduce((s, l) => s + l.paidAmount, 0);
  const totalPending = totalLent - totalRecovered;
  const count = loans.length;

  const donutData = [
    { name: 'Đã thu hồi', value: totalRecovered },
    { name: 'Chưa thu', value: totalPending },
  ];
  const DONUT_COLORS = ['#10b981', '#6366f1'];

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.borrowerName.trim() || !addForm.totalAmount) return;
    const loan: Loan = {
      id: crypto.randomUUID(),
      borrowerName: addForm.borrowerName.trim(),
      totalAmount: Math.round(parseFloat(addForm.totalAmount)),
      paidAmount: 0,
      loanDate: new Date(addForm.loanDate).toISOString(),
      dueDate: addForm.dueDate ? new Date(addForm.dueDate).toISOString() : '',
      status: 'Đang vay',
      note: addForm.note.trim(),
      createdAt: new Date().toISOString(),
      payments: [],
    };
    dispatch({ type: 'ADD_LOAN', payload: loan });
    setShowAddModal(false);
    setAddForm({ borrowerName: '', totalAmount: '', loanDate: new Date().toISOString().slice(0, 10), dueDate: '', note: '' });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLoanId || !payForm.amount) return;
    const payment: LoanPayment = {
      id: crypto.randomUUID(),
      amount: Math.round(parseFloat(payForm.amount)),
      date: new Date(payForm.date).toISOString(),
      note: payForm.note.trim(),
    };
    dispatch({ type: 'RECORD_LOAN_PAYMENT', payload: { loanId: paymentLoanId, payment } });
    setPaymentLoanId(null);
    setPayForm({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa khoản cho vay này?')) {
      dispatch({ type: 'DELETE_LOAN', payload: id });
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cho vay</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý các khoản tiền cho vay</p>
        </div>
        <button
          id="add-loan-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Thêm khoản cho vay
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Tổng cho vay', value: fmt(totalLent), color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
          { label: 'Đã thu hồi', value: fmt(totalRecovered), color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
          { label: 'Chưa thu', value: fmt(totalPending), color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
          { label: 'Số khoản', value: count.toString(), color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', text: 'text-violet-400' },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-4 md:p-5`}>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className={`text-lg md:text-xl font-bold mt-1 ${card.text} break-all`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + List layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-1 bg-[#1a1f2e] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 mb-4">Tỷ lệ thu hồi</h2>
          {totalLent === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600">
              <CreditCard className="w-10 h-10 mb-2" />
              <p className="text-sm">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: unknown) => [fmt(Number(v)), '']}
                  contentStyle={{ background: '#1a1f2e', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Loan List */}
        <div className="lg:col-span-2 space-y-3">
          {loans.length === 0 ? (
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-600">
              <CreditCard className="w-12 h-12 mb-3" />
              <p className="font-medium">Chưa có khoản cho vay nào</p>
              <p className="text-sm mt-1">Nhấn &quot;Thêm khoản cho vay&quot; để bắt đầu</p>
            </div>
          ) : (
            loans.map((loan) => {
              const pct = loan.totalAmount > 0 ? Math.min((loan.paidAmount / loan.totalAmount) * 100, 100) : 0;
              const initial = loan.borrowerName.trim().charAt(0).toUpperCase();
              return (
                <div key={loan.id} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm">{loan.borrowerName}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(loan.status)}`}>
                          <StatusIcon status={loan.status} />
                          {loan.status}
                        </span>
                      </div>
                      {loan.note && <p className="text-xs text-slate-500 mb-2 truncate">{loan.note}</p>}

                      {/* Progress */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Đã thu: <span className="text-emerald-400 font-medium">{fmt(loan.paidAmount)}</span></span>
                          <span>Tổng: <span className="text-white font-medium">{fmt(loan.totalAmount)}</span></span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-600">{pct.toFixed(0)}% thu hồi</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-3">
                        <span>Ngày vay: {fmtDate(loan.loanDate)}</span>
                        {loan.dueDate && <span>Hạn trả: {fmtDate(loan.dueDate)}</span>}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {loan.status !== 'Đã thu hồi' && (
                          <button
                            onClick={() => { setPaymentLoanId(loan.id); setPayForm({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' }); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Ghi nhận thanh toán
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(loan.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#1a1f2e] border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">Thêm khoản cho vay</h2>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Tên người vay *</label>
                <input
                  id="loan-borrower"
                  type="text"
                  required
                  value={addForm.borrowerName}
                  onChange={(e) => setAddForm({ ...addForm, borrowerName: e.target.value })}
                  placeholder="Nhập tên người vay..."
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Số tiền cho vay (đ) *</label>
                <input
                  id="loan-amount"
                  type="number"
                  required
                  min="1"
                  value={addForm.totalAmount}
                  onChange={(e) => setAddForm({ ...addForm, totalAmount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Ngày cho vay</label>
                  <input
                    id="loan-date"
                    type="date"
                    value={addForm.loanDate}
                    onChange={(e) => setAddForm({ ...addForm, loanDate: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Hạn trả</label>
                  <input
                    id="loan-due"
                    type="date"
                    value={addForm.dueDate}
                    onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Ghi chú</label>
                <input
                  id="loan-note"
                  type="text"
                  value={addForm.note}
                  onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                  placeholder="Mục đích, điều khoản..."
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentLoanId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentLoanId(null)} />
          <div className="relative bg-[#1a1f2e] border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
            {(() => {
              const loan = loans.find((l) => l.id === paymentLoanId);
              return (
                <>
                  <h2 className="text-lg font-bold text-white mb-1">Ghi nhận thanh toán</h2>
                  {loan && <p className="text-sm text-slate-500 mb-5">Người vay: <span className="text-slate-300">{loan.borrowerName}</span></p>}
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">Số tiền đã trả (đ) *</label>
                      <input
                        id="pay-amount"
                        type="number"
                        required
                        min="1"
                        value={payForm.amount}
                        onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                        placeholder="0"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">Ngày thanh toán</label>
                      <input
                        id="pay-date"
                        type="date"
                        value={payForm.date}
                        onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">Ghi chú</label>
                      <input
                        id="pay-note"
                        type="text"
                        value={payForm.note}
                        onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
                        placeholder="Ghi chú..."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setPaymentLoanId(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Hủy</button>
                      <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-600/30">Ghi nhận</button>
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
