'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Lock, LogOut, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '');
        setMemberSince(
          new Date(data.user.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          })
        );
      }
      setLoading(false);
    });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess('Đổi mật khẩu thành công!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatar = email ? email[0].toUpperCase() : 'U';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tài khoản</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý thông tin và bảo mật</p>
      </div>

      {/* User Info */}
      <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
            {avatar}
          </div>
          <div>
            <p className="text-white font-semibold">{email}</p>
            <p className="text-xs text-slate-500 mt-0.5">Thành viên từ {memberSince}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-800/40 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Email</p>
              <p className="text-xs font-medium text-slate-300 truncate max-w-[160px]">{email}</p>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Trạng thái</p>
              <p className="text-xs font-medium text-emerald-400">Đang hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Đổi mật khẩu</h2>
            <p className="text-[11px] text-slate-500">Cập nhật mật khẩu tài khoản của bạn</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Mật khẩu mới *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Xác nhận mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {pwError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
              <p className="text-xs text-rose-400">{pwError}</p>
            </div>
          )}
          {pwSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
              <p className="text-xs text-emerald-400">{pwSuccess}</p>
            </div>
          )}

          <button
            id="change-password-btn"
            type="submit"
            disabled={pwLoading}
            className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {pwLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            {pwLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1a1f2e] border border-rose-500/20 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-rose-400 mb-1">Vùng nguy hiểm</h2>
        <p className="text-xs text-slate-500 mb-4">Đăng xuất khỏi tài khoản của bạn</p>
        <button
          id="logout-btn"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 text-sm font-semibold border border-rose-500/30 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {logoutLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    </div>
  );
}
