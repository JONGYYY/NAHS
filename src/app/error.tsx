"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PigmentRow } from "@/components/brand/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <PigmentRow />
      <p className="eyebrow">Error</p>
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        The page hit an unexpected error. Try again, and if it keeps happening let an officer know.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
