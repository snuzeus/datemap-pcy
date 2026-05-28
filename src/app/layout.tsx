import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '답정너 — 데이터 기반 핫플 탐색',
  description: '지금 가장 핫한 지역을 데이터로 찾고, 취향에 맞는 장소와 동선을 한 번에 완성하는 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
