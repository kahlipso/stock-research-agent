"use client";
import { APP_NAME } from "@/lib/config/app";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">{APP_NAME} is unavailable</h1><p className="mt-3 muted">The page could not be loaded. No trade or external action was taken.</p><button onClick={reset} className="focus-ring mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white">Try again</button></main>; }
