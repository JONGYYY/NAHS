import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <Wordmark subtitle="Chapter register" className="mb-10" />
        <p className="font-mono text-6xl font-semibold tabular-nums text-stamp">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          This page is not in the register. It may have moved or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
