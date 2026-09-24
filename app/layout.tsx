import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/components/context/RoleContext';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { AuthGuard } from '@/components/context/AuthGuard';

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
            <AuthGuard>{children}</AuthGuard>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

