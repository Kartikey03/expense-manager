import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Expense Manager",
  description: "Personal income, expense & investment dashboard",
};

export const viewport: Viewport = {
  themeColor: "#070a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="aurora" />
        <div className="grid-overlay" />
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(18,24,41,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              color: "#e7e9f3",
            },
          }}
        />
      </body>
    </html>
  );
}
