import Link from "next/link";
import { APP_NAME } from "@/lib/config/app";
export default function NotFound() { return <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">Stock not found</h1><p className="mt-3 muted">{APP_NAME} only includes mock profiles for the seeded watchlist in this milestone.</p><Link href="/dashboard" className="focus-ring mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">Return to dashboard</Link></main>; }
