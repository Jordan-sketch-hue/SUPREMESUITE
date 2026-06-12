/* Reproduce /status platform checks in Node — find any hanging/throwing seed. */
import { SYSTEMS } from "../src/suite/systems/index";
import { brandVars, readableOn } from "../src/suite/lib/brand";

console.log("brand check…");
const vars = brandVars({ color: "#1f56a8", mode: "light", radius: "soft", font: "modern" });
console.log("  --brand =", vars["--brand"], "| fg:", readableOn("#1f56a8"), readableOn("#f4f4f5"));

for (const sys of SYSTEMS) {
  process.stdout.write(`seed ${sys.slug} … `);
  const t0 = Date.now();
  const mk = () =>
    sys.seed({
      tenantId: "det-test",
      now: 1765497600000,
      rand: (() => {
        let a = 42;
        return () => ((a = (a * 16807) % 2147483647) / 2147483647);
      })(),
    });
  const a = mk();
  const b = mk();
  const det = JSON.stringify(a.records.map((r) => r.title)) === JSON.stringify(b.records.map((r) => r.title));
  console.log(
    `${Date.now() - t0}ms · customers=${a.customers.length} records=${a.records.length} bookings=${a.bookings.length} det=${det} pipeline=${sys.pipeline.length} kpis=${sys.kpis.length} services=${sys.website.services.length}`,
  );
  if (!det) console.log(`  ⚠ NON-DETERMINISTIC: ${sys.slug}`);
}
console.log("ALL SEEDS OK");
