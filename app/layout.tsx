import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/components/context/RoleContext';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { AuthGuard } from '@/components/context/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'GROVASTRA — Saree Shop Product Discovery & Survey Analytics',
  description: 'Field-research, conditional-survey, pain-point discovery and analytics platform for saree shops.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-dark-900 text-slate-100 min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <RoleProvider>
            <AuthGuard>
              <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
                    {children}
                  </main>
                </div>
              </div>
            </AuthGuard>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
