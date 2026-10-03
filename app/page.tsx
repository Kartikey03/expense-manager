import { redirect } from "next/navigation";

// Middleware sends "/" to /dashboard or /login; this is only a static fallback.
export default function Home() {
  redirect("/dashboard");
}
