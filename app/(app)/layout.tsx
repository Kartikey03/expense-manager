import { AppShell } from "@/components/AppShell";

// Static on purpose: no server-side auth call here, so every page under this
// layout is prerendered and tab switches are served instantly from the client.
// Middleware already redirects signed-out visitors, and Row Level Security
// protects the data itself.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
