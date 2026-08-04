"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
