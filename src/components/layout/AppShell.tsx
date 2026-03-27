"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-full">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </>
  );
}
