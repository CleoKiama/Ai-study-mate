"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState, useEffect } from "react";

const sidebarItems: SidebarItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/upload", label: "Upload", icon: "📁" },
  { href: "/dashboard/summaries", label: "Summaries", icon: "📝" },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: "🧠" },
  { href: "/dashboard/progress", label: "Progress", icon: "📊" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={sidebarItems}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      }
      header={
        <Header 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)}
        />
      }
    >
      <div className="p-4 md:p-6">
        {children}
      </div>
    </AppShell>
  );
}