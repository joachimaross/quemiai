import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import FloatingDock from '@/components/FloatingDock';

export const metadata: Metadata = {
  title: 'Quemiai | Course Management Platform',
  description:
    'A modern course management platform built with Next.js and NestJS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-deep-space font-sans text-white antialiased',
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <FloatingDock />
        </div>
      </body>
    </html>
  );
}
