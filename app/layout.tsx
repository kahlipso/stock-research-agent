import type { Metadata } from "next";
import Link from "next/link";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config/app";
import "./globals.css";

export const metadata: Metadata = { title: { default: APP_NAME, template: `%s | ${APP_NAME}` }, description: APP_DESCRIPTION };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="border-b border-[var(--border)] bg-[var(--panel)]">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6" aria-label="Main navigation">
        <Link href="/dashboard" className="focus-ring rounded font-bold tracking-tight">{APP_NAME}</Link>
        <span className="text-xs text-[var(--muted)]">Research only · No trade execution</span>
      </nav>
    </header>
    {children}
  </body></html>;
}
