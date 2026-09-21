"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, BarChart3, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/attendance", label: "Attendance", icon: BarChart3 },
  { href: "/check-in", label: "Check in", icon: QrCode, primary: true },
  { href: "/hours", label: "Hours", icon: Clock },
  { href: "/events", label: "Events", icon: CalendarDays },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function MemberBottomNav() {
  const isActive = useIsActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isActive(item.href);
          if (item.primary) {
            return (
              <li key={item.href} className="flex items-center">
                <Link
                  href={item.href}
                  className="-mt-6 flex size-14 flex-col items-center justify-center rounded-[6px] bg-stamp text-stamp-foreground shadow-md"
                  aria-label={item.label}
                >
                  <item.icon className="size-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MemberSideNav() {
  const isActive = useIsActive();
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
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
    </nav>
  );
}
