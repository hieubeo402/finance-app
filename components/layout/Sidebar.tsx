'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Wallet,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Tổng quan tài chính' },
  { href: '/expenses', label: 'Chi tiêu', icon: TrendingDown, description: 'Quản lý chi tiêu' },
  { href: '/income', label: 'Thu nhập', icon: TrendingUp, description: 'Quản lý thu nhập' },
  { href: '/debts', label: 'Trả nợ', icon: CreditCard, description: 'Quản lý khoản nợ' },
];

interface SidebarProps {
  userEmail: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Lấy chữ cái đầu từ email
  const avatar = userEmail ? userEmail[0].toUpperCase() : 'U';

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-[#1a1f2e] border-r border-slate-800 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">HieubeoFinance</h1>
            <p className="text-xs text-slate-500 leading-tight">Quản lý Tài chính</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
          Menu chính
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-indigo-500/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${isActive ? 'text-indigo-300' : ''}`}>{item.label}</p>
                <p className="text-[10px] text-slate-600 leading-tight truncate">{item.description}</p>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-600">Đã đăng nhập</p>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200 text-xs font-medium"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>

        {/* Copyright */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-800/60">
          <p className="text-[10px] font-semibold text-slate-500">© 2025 HieubeoFinance</p>
          <p className="text-[10px] text-slate-700 mt-0.5">by hieubeo</p>
          <div className="mt-1.5 space-y-0.5">
            <a
              href="tel:0914289656"
              className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-indigo-400 transition-colors"
            >
              <span>📞</span> 0914.289.656
            </a>
            <a
              href="mailto:hieubeo402@gmail.com"
              className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-indigo-400 transition-colors truncate"
            >
              <span>✉️</span> hieubeo402@gmail.com
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
