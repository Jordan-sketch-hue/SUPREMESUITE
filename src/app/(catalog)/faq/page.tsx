/* FAQ — the questions a real buyer asks. */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, SectionTitle } from "@/suite/components/ui";

export const metadata = { title: "FAQ" };

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What exactly do I get in the 3-day free trial?",
    a: "Everything. The full CRM for your industry, your branded public website, the AI chatbot and voice agent, invoices, loyalty — with realistic demo data pre-loaded so you can feel it working immediately. No card required.",
  },
  {
    q: "What happens when the trial ends?",
    a: "Your workspace locks (nothing is deleted) and you choose a plan to continue. Your branding, data and website unlock exactly as you left them. You can also export everything as JSON/CSV at any time — your data is yours.",
  },
  {
    q: "How does 'make it feel like mine' work?",
    a: "Upload your logo, pick your brand color (or any custom hex), choose corner style and typography. The entire app, your public website, the chat widget, the favicon and even the installed desktop-app icon re-skin instantly.",
  },
  {
    q: "Can I really install it like a desktop app?",
    a: "Yes — every workspace is an installable PWA. On Windows/Mac it gets its own window and taskbar/dock icon (named after YOUR business), and it keeps a cached shell for flaky connections. Phones install it to the home screen.",
  },
  {
    q: "Does the AI chatbot actually book customers?",
    a: "Yes. It answers prices, hours and FAQs from your settings, then collects name → phone → service → date in a natural conversation and drops a real booking into your inbox. The voice agent does the same out loud — try it on any demo.",
  },
  {
    q: "Is my customers' data safe?",
    a: "Trial workspaces run entirely in your browser — data never leaves your device. Production workspaces move to a secured cloud database (Supabase) with per-tenant isolation, and you keep one-click export forever.",
  },
  {
    q: "Can you migrate my existing customer list?",
    a: "Yes — CSV import is built in, and on the Scale tier we do the migration for you (spreadsheets, exports from other CRMs, even the notebook on your counter).",
  },
  {
    q: "What if my industry isn't in the catalog?",
    a: "That's our favorite request. J Supreme Tech builds custom systems on the same engine — custom pipeline, fields and website. Most custom builds ship in days. Start at the Custom builds page.",
  },
  {
    q: "Do you support Jamaican businesses specifically?",
    a: "We're built from Jamaica for the world. JMD billing, WhatsApp-first communication, local payment rails (WiPay) on the roadmap alongside Stripe — and yes, the voice agent understands 'wah gwaan'.",
  },
  {
    q: "How do I know the platform actually works?",
    a: "Don't take our word — open /status. It runs every page, link and business workflow live in front of you and shows the results. We publish our receipts.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-x max-w-3xl py-14 md:py-20">
      <SectionTitle align="center" eyebrow="FAQ" title="Questions, answered straight." />
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="group rounded-2xl border border-line bg-surface p-5 shadow-card open:shadow-pop" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[15px] font-semibold">
              {f.q}
              <span className="text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/start">
          <Button variant="dark" size="lg">
            Convinced? Start free <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
