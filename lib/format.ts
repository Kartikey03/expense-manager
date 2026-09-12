export function formatINR(n: number, opts: { compact?: boolean; sign?: boolean } = {}) {
  const { compact, sign } = opts;
  const abs = Math.abs(n);
  let body: string;
  if (compact && abs >= 1000) {
    body = new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(abs);
  } else {
    body = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(abs);
  }
  const prefix = n < 0 ? "-₹" : sign ? "+₹" : "₹";
  return `${prefix}${body}`;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthKey(dateStr: string) {
  // returns YYYY-MM
  return dateStr.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTHS[parseInt(m, 10) - 1]?.slice(0, 3)} ${y}`;
}

export function prettyDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
