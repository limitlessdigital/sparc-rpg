import type { ReactNode } from "react";
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, Button, Avatar } from "@sparc/ui";
import { ProtectedRoute, useAuth } from "@/lib/auth-context";

// Icon component for SVG icons
function NavIcon({ name, className }: { name: string; className?: string }) {
  return (
    <img 
      src={`/assets/icons/dark/${name}.svg`} 
      alt="" 
      className={cn("w-5 h-5", className)}
    />
  );
}

// Navigation items - routes are at root level (not under /dashboard)
const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/characters", label: "Characters", icon: "characters" },
  { href: "/sessions", label: "Sessions", icon: "sessions" },
  { href: "/adventures", label: "Adventures", icon: "adventures" },
  { href: "/homebrew", label: "Homebrew", icon: "homebrew" },
  { href: "/social", label: "Social", icon: "portal" },
  { href: "/seer", label: "Seer Dashboard", icon: "adventures" },
];

function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-surface-divider flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-surface-divider">
        <Link href="/" className="block">
          <Image 
            src="/sparc-logo-weathered.png" 
            alt="SPARC RPG" 
            width={150} 
            height={70}
            className="h-12 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-bronze/10 text-bronze"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            )}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-divider">
        <div className="flex items-center gap-3 mb-4">
          <Avatar 
            src={user?.avatarUrl} 
            alt={user?.username || "User"} 
            fallback={user?.username?.charAt(0).toUpperCase() || "U"}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start" 
          onClick={logout}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

function DashboardHeader() {
  const pathname = usePathname();
  
  // Derive page title from pathname
  const getTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1) return "Dashboard";
    const last = segments[segments.length - 1];
    if (last === "new") return `New ${segments[segments.length - 2]?.slice(0, -1)}`;
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <header className="h-16 border-b border-surface-divider flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
      <div className="flex items-center gap-4">
        {/* Notifications, settings, etc. can go here */}
        <Button variant="ghost" size="sm">🔔</Button>
        <Button variant="ghost" size="sm">⚙️</Button>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-base">
        <DashboardSidebar />
        <div className="ml-64">
          <DashboardHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
