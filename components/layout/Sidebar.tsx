'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Wallet,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Tổng quan tài chính',
  },
  {
    href: '/expenses',
    label: 'Chi tiêu',
    icon: TrendingDown,
    description: 'Quản lý chi tiêu',
  },
  {
    href: '/income',
    label: 'Thu nhập',
    icon: TrendingUp,
    description: 'Quản lý thu nhập',
  },
  {
    href: '/debts',
    label: 'Trả nợ',
    icon: CreditCard,
    description: 'Quản lý khoản nợ',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-[#1a1f2e] border-r border-slate-800 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">FinanceFlow</h1>
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
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20'
                    : 'bg-slate-800 group-hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${isActive ? 'text-indigo-300' : ''}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-600 leading-tight truncate">
                  {item.description}
                </p>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300">Người dùng</p>
            <p className="text-[10px] text-slate-600">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
