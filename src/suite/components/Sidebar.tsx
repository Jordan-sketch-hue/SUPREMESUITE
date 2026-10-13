"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSystem, demoSlugToSystem, SYSTEMS } from "@/suite/systems";

type Props = {
  // tenantSlug is passed as a prop from the Server Component layout,
  // so this Client Component never calls useParams() — no SSR placeholder bug.
  tenantSlug: string;
  workspaceName: string;
  systemColor: string;
};

export function Sidebar({ tenantSlug, workspaceName, systemColor }: Props) {
  const pathname = usePathname();

  const system =
    tenantSlug.startsWith("demo-")
      ? demoSlugToSystem(tenantSlug)
      : getSystem(tenantSlug.split("-").slice(0, -1).join("-")) ??
        SYSTEMS.find((s) => tenantSlug.includes(s.slug));

  if (!system) return null;

  const basePath = `/app/${tenantSlug}`;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-700 bg-slate-900">
      <div className="border-b border-slate-700 px-5 py-4">
        <div
          className="mb-1 h-1 w-8 rounded-full"
          style={{ backgroundColor: systemColor }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {system.name}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-100">{workspaceName}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {system.navItems.map((item) => {
            const href = basePath + item.href;
            const isActive =
              item.href === ""
                ? pathname === basePath || pathname === basePath + "/"
                : pathname.startsWith(href);

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-slate-700 font-medium text-slate-100"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-700 px-5 py-3">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
          ← All tools
        </Link>
      </div>
    </aside>
  );
}
