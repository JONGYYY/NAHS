import Link from "next/link";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <AdminMobileNav />
              <Link href="/admin" className="md:hidden">
                <Wordmark subtitle="Admin console" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <Eye />
                  <span className="hidden sm:inline">View as student</span>
                </Link>
              </Button>
              <UserMenu
                name={profile.full_name}
                email={profile.email}
                avatarUrl={profile.avatar_url}
                isAdmin
                context="admin"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
