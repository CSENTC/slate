"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  Layers,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder", label: "Builder", icon: CalendarDays },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/rooms", label: "Rooms", icon: Building2 },
  { href: "/classes", label: "Classes", icon: GraduationCap },
  { href: "/allocations", label: "Allocations", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppRail() {
  const pathname = usePathname();

  return (
    <aside className="w-16 md:w-20 border-r border-line bg-surface flex flex-col items-center py-6 select-none shrink-0 z-40">
      {/* Brand Icon */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold font-mono text-lg mb-8 hover:opacity-90 transition-opacity"
        title="Slate Home"
      >
        S
      </Link>

      {/* Nav links */}
      <nav className="flex flex-col gap-3 flex-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-muted hover:text-ink hover:bg-bg/80"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-tight">{item.label}</span>

              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footnote status */}
      <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted font-mono text-[10px]">
        v1
      </div>
    </aside>
  );
}

