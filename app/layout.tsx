import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Apple devices render SF Pro via -apple-system; Inter is the closest
// fallback everywhere else (Windows, Android).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Expense Manager",
  description: "Personal income, expense & investment tracker",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          offset={16}
          toastOptions={{
            style: {
              background: "#2c2c2e",
              border: "none",
              borderRadius: 14,
              color: "#f5f5f7",
              fontSize: 14,
            },
          }}
        />
      </body>
    </html>
  );
}
