import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Cup | 나만의 커피 챗봇",
  description: "오늘의 기분과 취향에 맞는 커피를 찾아드려요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
