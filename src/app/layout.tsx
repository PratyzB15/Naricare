import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { PT_Sans } from 'next/font/google';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';

// Configure PT Sans font
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

// Metadata for SEO and tab title
export const metadata: Metadata = {
  title: 'NariCare',
  description: 'Track your health with NariCare',
};

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', ptSans.variable)}>
        {/* Theme provider must wrap all theme-dependent components */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Sidebar provider for layout management */}
          <SidebarProvider>
            {children}
          </SidebarProvider>
          {/* Toast notifications */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}