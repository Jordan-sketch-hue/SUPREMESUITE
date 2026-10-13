import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
      <h1 className="mb-2 text-6xl font-bold text-slate-600">404</h1>
      <p className="mb-6 text-slate-400">Page not found.</p>
      <Link href="/" className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600">
        Back to home
      </Link>
    </main>
  );
}
