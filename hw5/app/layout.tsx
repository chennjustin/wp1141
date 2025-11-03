import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "X-Clone HW5",
  description: "Simplified Twitter-like app with NextAuth and Prisma",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white shadow-sm border rounded-xl p-6">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}


