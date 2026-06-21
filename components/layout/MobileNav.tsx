'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Target,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Chi tiêu', icon: TrendingDown },
  { href: '/income', label: 'Thu nhập', icon: TrendingUp },
  { href: '/loans', label: 'Cho vay', icon: DollarSign },
  { href: '/budgets', label: 'Ngân sách', icon: Target },
  { href: '/debts', label: 'Nợ', icon: CreditCard },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1f2e] border-t border-slate-800 safe-area-pb">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${
                isActive ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-indigo-500" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
