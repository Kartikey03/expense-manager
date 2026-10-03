export function formatINR(n: number, opts: { compact?: boolean; sign?: boolean } = {}) {
  const { compact, sign } = opts;
  const abs = Math.abs(n);
  const body =
    compact && abs >= 1000
      ? new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(abs)
      : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(abs);
  const prefix = n < 0 ? "−₹" : sign ? "+₹" : "₹";
  return `${prefix}${body}`;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MON = MONTHS.map((m) => m.slice(0, 3));

const pad = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD in the user's local timezone (toISOString() would use UTC). */
export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** YYYY-MM */
export function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

/** "Sep 2026" */
export function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MON[parseInt(m, 10) - 1]} ${y}`;
}

/** "September 2026" */
export function monthTitle(key: string) {
  const [y, m] = key.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

/** "12 Sep" — adds the year only when it isn't the current one. */
export function shortDate(dateStr: string) {
  const d = parseISODate(dateStr);
  const base = `${d.getDate()} ${MON[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** "12 Sep 2026" */
export function longDate(dateStr: string) {
  const d = parseISODate(dateStr);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}
