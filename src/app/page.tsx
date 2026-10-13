import Link from "next/link";
import { SYSTEMS } from "@/suite/systems";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">Supreme Suite</h1>
          <p className="text-xl text-slate-400">
            One engine. 13 industry-specific SaaS tools.
          </p>
        </header>

        <section>
          <h2 className="mb-8 text-2xl font-semibold text-slate-300">Try a Demo</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEMS.map((system) => (
              <Link
                key={system.slug}
                href={`/app/demo-${system.slug}`}
                className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition hover:border-slate-500"
              >
                <div
                  className="mb-3 h-2 w-12 rounded-full"
                  style={{ backgroundColor: system.color }}
                />
                <h3 className="mb-1 text-lg font-semibold text-slate-100 group-hover:text-white">
                  {system.name}
                </h3>
                <p className="text-sm text-slate-400">{system.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
