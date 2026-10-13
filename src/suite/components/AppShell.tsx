import { Sidebar } from "./Sidebar";

type Props = {
  tenantSlug: string;
  workspaceName: string;
  systemColor: string;
  children: React.ReactNode;
};

export function AppShell({ tenantSlug, workspaceName, systemColor, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar
        tenantSlug={tenantSlug}
        workspaceName={workspaceName}
        systemColor={systemColor}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
