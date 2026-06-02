import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MAGI SYSTEM — Trinity Decision Engine',
  description: '다중 AI 에이전트 교차 검증 시뮬레이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen hex-bg">
        <div className="scanline-overlay" />
        {children}
      </body>
    </html>
  );
}
