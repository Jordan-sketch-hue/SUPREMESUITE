export type NavItem = { label: string; href: string };

export type KpiDef = {
  key: string;
  label: string;
  unit?: string;
  seedValue: number | string;
};

export type SystemDef = {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  navItems: NavItem[];
  kpis: KpiDef[];
};

export const SYSTEMS: SystemDef[] = [
  {
    slug: "fleet-run",
    name: "FleetRun",
    tagline: "Fleet & delivery management",
    color: "#2563eb",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Vehicles", href: "/vehicles" },
      { label: "Drivers", href: "/drivers" },
      { label: "Dispatches", href: "/dispatches" },
      { label: "Routes", href: "/routes" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_vehicles", label: "Active Vehicles", seedValue: 24 },
      { key: "drivers_on_duty", label: "Drivers On Duty", seedValue: 18 },
      { key: "deliveries_today", label: "Deliveries Today", seedValue: 142 },
      { key: "avg_delivery_min", label: "Avg Delivery Time", unit: "min", seedValue: 38 },
    ],
  },
  {
    slug: "haul-base",
    name: "HaulBase",
    tagline: "Trucking & freight operations",
    color: "#d97706",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Trucks", href: "/trucks" },
      { label: "Operators", href: "/operators" },
      { label: "Loads", href: "/loads" },
      { label: "Lanes", href: "/lanes" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_trucks", label: "Active Trucks", seedValue: 31 },
      { key: "loads_dispatched", label: "Loads Dispatched", seedValue: 19 },
      { key: "miles_today", label: "Miles Today", unit: "mi", seedValue: 4820 },
      { key: "on_time_pct", label: "On-Time %", unit: "%", seedValue: 94 },
    ],
  },
  {
    slug: "stock-ops",
    name: "StockOps",
    tagline: "Inventory & warehouse management",
    color: "#7c3aed",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Products", href: "/products" },
      { label: "Warehouses", href: "/warehouses" },
      { label: "Orders", href: "/orders" },
      { label: "Suppliers", href: "/suppliers" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "skus_tracked", label: "SKUs Tracked", seedValue: 1284 },
      { key: "low_stock_alerts", label: "Low Stock Alerts", seedValue: 7 },
      { key: "orders_pending", label: "Orders Pending", seedValue: 43 },
      { key: "turnover_rate", label: "Turnover Rate", unit: "×", seedValue: 6.2 },
    ],
  },
  {
    slug: "dwell-desk",
    name: "DwellDesk",
    tagline: "Hotel & lodging property management",
    color: "#0891b2",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Rooms", href: "/rooms" },
      { label: "Reservations", href: "/reservations" },
      { label: "Guests", href: "/guests" },
      { label: "Housekeeping", href: "/housekeeping" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "occupancy_pct", label: "Occupancy", unit: "%", seedValue: 78 },
      { key: "checkins_today", label: "Check-ins Today", seedValue: 12 },
      { key: "revenue_per_night", label: "Revenue / Night", unit: "$", seedValue: 8940 },
      { key: "avg_stay_nights", label: "Avg Stay", unit: "nights", seedValue: 2.4 },
    ],
  },
  {
    slug: "table-flow",
    name: "TableFlow",
    tagline: "Restaurant table & reservation management",
    color: "#dc2626",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Tables", href: "/tables" },
      { label: "Reservations", href: "/reservations" },
      { label: "Orders", href: "/orders" },
      { label: "Menu", href: "/menu" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "tables_seated", label: "Tables Seated", seedValue: 14 },
      { key: "covers_today", label: "Covers Today", seedValue: 186 },
      { key: "avg_check", label: "Avg Check", unit: "$", seedValue: 62 },
      { key: "wait_time_min", label: "Wait Time", unit: "min", seedValue: 12 },
    ],
  },
  {
    slug: "glow-desk",
    name: "GlowDesk",
    tagline: "Beauty salon & spa management",
    color: "#db2777",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Appointments", href: "/appointments" },
      { label: "Clients", href: "/clients" },
      { label: "Services", href: "/services" },
      { label: "Staff", href: "/staff" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "appointments_today", label: "Appointments Today", seedValue: 28 },
      { key: "new_clients", label: "New Clients", seedValue: 4 },
      { key: "revenue_today", label: "Revenue Today", unit: "$", seedValue: 1840 },
      { key: "utilization_pct", label: "Utilization", unit: "%", seedValue: 82 },
    ],
  },
  {
    slug: "slot-iq",
    name: "SlotIQ",
    tagline: "Smart appointment & slot booking",
    color: "#16a34a",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Slots", href: "/slots" },
      { label: "Bookings", href: "/bookings" },
      { label: "Providers", href: "/providers" },
      { label: "Services", href: "/services" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "slots_available", label: "Slots Available", seedValue: 34 },
      { key: "bookings_today", label: "Bookings Today", seedValue: 51 },
      { key: "fill_rate_pct", label: "Fill Rate", unit: "%", seedValue: 71 },
      { key: "cancellations", label: "Cancellations", seedValue: 3 },
    ],
  },
  {
    slug: "tour-base",
    name: "TourBase",
    tagline: "Tour & travel operations",
    color: "#0369a1",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Tours", href: "/tours" },
      { label: "Bookings", href: "/bookings" },
      { label: "Guides", href: "/guides" },
      { label: "Destinations", href: "/destinations" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_tours", label: "Active Tours", seedValue: 8 },
      { key: "bookings_this_week", label: "Bookings This Week", seedValue: 64 },
      { key: "travelers_today", label: "Travelers Today", seedValue: 97 },
      { key: "revenue_today", label: "Revenue Today", unit: "$", seedValue: 12480 },
    ],
  },
  {
    slug: "enroll-iq",
    name: "EnrollIQ",
    tagline: "Education enrollment management",
    color: "#92400e",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Programs", href: "/programs" },
      { label: "Students", href: "/students" },
      { label: "Enrollments", href: "/enrollments" },
      { label: "Instructors", href: "/instructors" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_students", label: "Active Students", seedValue: 342 },
      { key: "enrollments_month", label: "Enrollments This Month", seedValue: 28 },
      { key: "completion_rate_pct", label: "Completion Rate", unit: "%", seedValue: 88 },
      { key: "waitlist", label: "Waitlist", seedValue: 15 },
    ],
  },
  {
    slug: "punch-pro",
    name: "PunchPro",
    tagline: "Time, attendance & workforce management",
    color: "#475569",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Employees", href: "/employees" },
      { label: "Shifts", href: "/shifts" },
      { label: "Timecards", href: "/timecards" },
      { label: "Schedules", href: "/schedules" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "clocked_in", label: "Clocked In Now", seedValue: 47 },
      { key: "hours_today", label: "Hours Today", unit: "hrs", seedValue: 186 },
      { key: "overtime_alerts", label: "Overtime Alerts", seedValue: 2 },
      { key: "attendance_pct", label: "Attendance Rate", unit: "%", seedValue: 96 },
    ],
  },
  {
    slug: "signal-board",
    name: "SignalBoard",
    tagline: "Marketing & communications hub",
    color: "#ea580c",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Campaigns", href: "/campaigns" },
      { label: "Contacts", href: "/contacts" },
      { label: "Messages", href: "/messages" },
      { label: "Templates", href: "/templates" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_campaigns", label: "Active Campaigns", seedValue: 5 },
      { key: "messages_sent", label: "Messages Sent", seedValue: 8340 },
      { key: "open_rate_pct", label: "Open Rate", unit: "%", seedValue: 34 },
      { key: "conversions", label: "Conversions", seedValue: 212 },
    ],
  },
  {
    slug: "desk-bot",
    name: "DeskBot",
    tagline: "Help desk & customer support",
    color: "#0d9488",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Tickets", href: "/tickets" },
      { label: "Agents", href: "/agents" },
      { label: "Knowledge Base", href: "/kb" },
      { label: "Queues", href: "/queues" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "open_tickets", label: "Open Tickets", seedValue: 23 },
      { key: "resolved_today", label: "Resolved Today", seedValue: 41 },
      { key: "avg_response_min", label: "Avg Response Time", unit: "min", seedValue: 8 },
      { key: "csat_score", label: "CSAT Score", unit: "/5", seedValue: 4.6 },
    ],
  },
  {
    slug: "ring-pilot",
    name: "RingPilot",
    tagline: "Call center operations management",
    color: "#6d28d9",
    navItems: [
      { label: "Dashboard", href: "" },
      { label: "Calls", href: "/calls" },
      { label: "Agents", href: "/agents" },
      { label: "Queues", href: "/queues" },
      { label: "Scripts", href: "/scripts" },
      { label: "Reports", href: "/reports" },
    ],
    kpis: [
      { key: "active_calls", label: "Active Calls", seedValue: 14 },
      { key: "calls_today", label: "Calls Today", seedValue: 389 },
      { key: "avg_handle_sec", label: "Avg Handle Time", unit: "sec", seedValue: 214 },
      { key: "answer_rate_pct", label: "Answer Rate", unit: "%", seedValue: 91 },
    ],
  },
];

export function getSystem(slug: string): SystemDef | undefined {
  return SYSTEMS.find((s) => s.slug === slug);
}

export function demoSlugToSystem(demoSlug: string): SystemDef | undefined {
  // demo-fleet-run → fleet-run
  const systemSlug = demoSlug.startsWith("demo-") ? demoSlug.slice(5) : demoSlug;
  return getSystem(systemSlug);
}
