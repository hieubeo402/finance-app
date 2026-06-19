import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/lib/store/FinanceContext';
import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HieubeoFinance — Quản lý Tài chính Cá nhân',
  description: 'Ứng dụng quản lý tài chính cá nhân bởi hieubeo. Hỗ trợ: 0914.289.656 | hieubeo402@gmail.com',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="vi" className={inter.variable}>
      <body className="bg-[#0f1117] text-slate-200 antialiased">
        {user ? (
          <FinanceProvider userId={user.id}>
            <div className="flex h-screen overflow-hidden">
              <Sidebar userEmail={user.email ?? ''} />
              <main className="flex-1 overflow-y-auto bg-[#0f1117]">
                {children}
              </main>
            </div>
          </FinanceProvider>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
