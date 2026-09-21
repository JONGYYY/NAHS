import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { Wordmark } from "@/components/brand/logo";
import { MemberBottomNav, MemberSideNav } from "@/components/layout/member-nav";
import { UserMenu } from "@/components/layout/user-menu";

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
          <UserMenu
            name={profile.full_name}
            email={profile.email}
            avatarUrl={profile.avatar_url}
            isAdmin={profile.role === "admin"}
            context="member"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      <MemberBottomNav />
    </div>
  );
}
