import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'サレジオ同窓会 進捗管理',
  description: '静岡サレジオ同窓会の進捗管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}