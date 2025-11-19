import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Line Bot 管理後台",
  description: "Line Bot 智慧聊天機器人管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}

