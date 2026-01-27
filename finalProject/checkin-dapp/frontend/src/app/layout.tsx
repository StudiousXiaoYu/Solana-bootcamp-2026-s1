import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Check-in DApp",
  description: "链上打卡 + 成就徽章（NFT）DApp",
};

/**
 * 应用根布局。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

