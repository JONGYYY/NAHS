"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Palette,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark, PigmentRow } from "@/components/brand/logo";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/activities", label: "Activities", icon: Palette },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <div className="sticky top-0 flex h-dvh flex-col">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5">
          <Wordmark subtitle="Admin console" />
          <PigmentRow />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNavLinks />
        </div>
      </div>
    </aside>
  );
}
