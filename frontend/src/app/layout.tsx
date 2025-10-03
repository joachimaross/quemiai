import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import FloatingDock from '@/components/FloatingDock';
import { AppProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: 'Quemi Social | Connect, Share, Inspire',
  description:
    'A modern social media and messaging platform inspired by Apple Messages and Google Messages. Connect with friends, share moments, and stay in touch.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-deep-space font-sans text-white antialiased',
        )}
      >
        <AppProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <FloatingDock />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
