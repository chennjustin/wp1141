import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的時程表 - 拯救期末大作戰",
  description: "個人時程表",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

