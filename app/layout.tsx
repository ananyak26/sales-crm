import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import SessionGuard from "@/components/SessionGuard";

export const metadata: Metadata = {
  title: "Sales CRM",
  description: "Internal CRM for deals, quotes and invoices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionGuard />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
