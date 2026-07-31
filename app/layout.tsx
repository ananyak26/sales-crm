import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
