import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          // Stops a CDN from caching a response that carries a refreshed session.
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    }
  );

  // getClaims() verifies the JWT locally against the project's ES256 public key
  // (cached for 10 min), so it adds no network round trip. getUser() called the
  // Supabase Auth server on every request — that was the main cause of slow
  // tab switches. It still refreshes an expired session when needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims?.sub;

  const path = request.nextUrl.pathname;
  const redirect = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (path === "/") return redirect(signedIn ? "/dashboard" : "/login");
  if (!signedIn && !PUBLIC_PATHS.some((p) => path.startsWith(p))) return redirect("/login");
  if (signedIn && path === "/login") return redirect("/dashboard");

  return response;
}
