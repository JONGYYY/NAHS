import Link from "next/link";
import { Shield } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { Wordmark } from "@/components/brand/logo";
import { MemberBottomNav, MemberSideNav } from "@/components/layout/member-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireMember();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard">
            <Wordmark subtitle="Chapter register" />
          </Link>
          <MemberSideNav />
          <div className="flex items-center gap-2">
            {profile.role === "admin" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                  <Shield />
                  <span className="hidden sm:inline">Admin view</span>
                </Link>
              </Button>
            ) : null}
            <UserMenu
              name={profile.full_name}
              email={profile.email}
              avatarUrl={profile.avatar_url}
              isAdmin={profile.role === "admin"}
              context="member"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      <MemberBottomNav />
    </div>
  );
}
