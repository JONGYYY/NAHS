import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Wordmark, PigmentRow } from "@/components/brand/logo";
import { PIGMENTS } from "@/lib/constants";

const REGISTER = [
  {
    name: "Meetings",
    body: "Weekly check-ins, recorded by the code an officer reads out.",
  },
  {
    name: "Attendance",
    body: "Your rate, your current streak, and where your standing sits.",
  },
  {
    name: "SSL hours",
    body: "Service-learning hours from every project, logged and totaled.",
  },
  {
    name: "Activities",
    body: "The projects you joined, from holiday cards to chapter murals.",
  },
];

export default async function LandingPage() {
  const profile = await getProfile();
  if (profile) {
    if (!profile.full_name || !profile.grade) redirect("/onboarding");
    if (profile.status !== "active") redirect("/pending");
    redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark subtitle="Chapter register" />
        <PigmentRow className="hidden sm:inline-flex" />
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-14 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="eyebrow">National Art Honor Society</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
            Check in, and keep your record.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Sign in with your school Google account to check into weekly meetings, log your SSL
            hours, and see the activities you have been part of.
          </p>

          <div className="mt-8 max-w-sm">
            <GoogleSignInButton />
            <p className="mt-3 text-xs text-muted-foreground">
              Use your school email. New members are approved by an officer before their first
              check-in.
            </p>
          </div>
        </div>

        <div className="rounded-[6px] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <p className="eyebrow">What the register keeps</p>
            <span className="font-mono text-xs text-muted-foreground">4 entries</span>
          </div>
          <ul>
            {REGISTER.map((item, i) => (
              <li
                key={item.name}
                className="flex gap-4 border-b border-border px-5 py-4 last:border-b-0"
              >
                <span
                  className="mt-0.5 font-mono text-xs font-medium tabular-nums"
                  style={{ color: PIGMENTS[i] }}
                >
                  No.{String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-display text-base font-semibold leading-tight">
                    {item.name}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Wordmark subtitle="Chapter register" />
          <div className="flex flex-col gap-3 sm:items-end">
            <nav className="flex gap-5 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              Kept by our chapter for art, character, and service.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
