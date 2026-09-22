import Link from "next/link";
import { Wordmark, PigmentRow } from "@/components/brand/logo";

export type LegalSection = {
  heading: string;
  body: string[];
};

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Home">
          <Wordmark subtitle="Chapter register" />
        </Link>
        <PigmentRow className="hidden sm:inline-flex" />
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 lg:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground">Last updated {updated}</p>
        <p className="mt-6 text-lg text-muted-foreground">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section, i) => (
            <section key={section.heading}>
              <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold">
                <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-muted-foreground">
                {section.body.map((paragraph, j) => (
                  <p key={j}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <footer className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Wordmark subtitle="Chapter register" />
          <nav className="flex gap-5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
