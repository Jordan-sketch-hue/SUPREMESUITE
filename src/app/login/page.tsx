export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-8">
        <h1 className="mb-6 text-xl font-bold text-slate-100">Sign in to your workspace</h1>
        <p className="text-sm text-slate-400">
          Contact your workspace admin to receive a sign-in link, or{" "}
          <a href="/" className="text-blue-400 underline">
            try a free demo
          </a>
          .
        </p>
      </div>
    </main>
  );
}
