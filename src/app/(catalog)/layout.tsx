import { CatalogShell } from "@/suite/components/catalog-shell";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <CatalogShell>{children}</CatalogShell>;
}
