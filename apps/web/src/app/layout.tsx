import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import FloatingDock from '@/components/FloatingDock';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'QUEMI | Unified Social Media & Messaging Hub',
  description:
    'QUEMI - Your unified social media and messaging platform. Connect Instagram, TikTok, Facebook, and X in one place. Featuring QuemiAi assistant for content creation and productivity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-deep-space dark:text-white',
        )}
      >
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <FloatingDock />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
