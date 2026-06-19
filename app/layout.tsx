import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/lib/store/FinanceContext';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FinanceFlow — Quản lý Tài chính Cá nhân',
  description: 'Ứng dụng quản lý tài chính cá nhân thông minh: theo dõi thu nhập, chi tiêu, và khoản nợ của bạn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="bg-[#0f1117] text-slate-200 antialiased">
        <FinanceProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-[#0f1117]">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
