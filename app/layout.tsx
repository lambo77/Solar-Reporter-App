import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Reporter",
  description: "Solar PV generation and consumption reporting dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span aria-hidden>☀️</span>
              Solar Reporter
            </Link>
            <div className="flex gap-6 text-sm text-slate-300">
              <Link href="/" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/reports" className="hover:text-white">
                Reports
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
