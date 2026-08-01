import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SessionGuard from "@/components/SessionGuard";
import MainShell from "@/components/MainShell";

export const metadata: Metadata = {
  title: "Sales CRM",
  description: "Internal CRM for deals, quotes and invoices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionGuard />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <MainShell>{children}</MainShell>
          </div>
        </div>
      </body>
    </html>
  );
}
