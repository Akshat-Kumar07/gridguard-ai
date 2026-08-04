import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GridGuard AI — Smart Grid Fault Detection",
  description:
    "AI-powered Smart Grid Fault Detection System. Monitor feeders, transformers, and poles in real-time with intelligent fault localization.",
  keywords: "smart grid, fault detection, AI, power grid, monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
