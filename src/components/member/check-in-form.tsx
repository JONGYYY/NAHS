"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, QrCode, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Your session expired. Please sign in again.",
  no_profile: "We couldn't find your profile. Contact an admin.",
  not_active: "Your membership isn't approved yet.",
  invalid_code: "That code isn't valid. Double-check it with an admin.",
  expired: "This code has expired. Ask an admin for a new one.",
};

type Result =
  | { state: "success"; meeting: string; already: boolean }
  | { state: "error"; message: string }
  | null;

export function CheckInForm({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setResult(null);

    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("check_in", { p_code: trimmed });

      if (error) {
        setResult({ state: "error", message: "Something went wrong. Please try again." });
        return;
      }

      const res = data as {
        ok: boolean;
        error?: string;
        meeting?: string;
        already?: boolean;
      };

      if (res.ok) {
        setResult({
          state: "success",
          meeting: res.meeting ?? "the meeting",
          already: Boolean(res.already),
        });
        router.refresh();
      } else {
        setResult({
          state: "error",
          message: ERROR_MESSAGES[res.error ?? ""] ?? "Check-in failed. Try again.",
        });
      }
    });
  }

  if (result?.state === "success") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <div className="flex size-24 rotate-[-6deg] items-center justify-center rounded-[8px] border-2 border-stamp/70 text-stamp">
            <CheckCircle2 className="size-12" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {result.already ? "Already on the register" : "You're on the register"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {result.already
                ? `You were already marked present for ${result.meeting}.`
                : `Attendance recorded for ${result.meeting}.`}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setResult(null);
                setCode("");
              }}
            >
              Enter another code
            </Button>
            <Button asChild className="flex-1">
              <a href="/dashboard">Go to dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-[6px] border border-border bg-muted">
              <QrCode className="size-7 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="code" className="eyebrow block text-center">
              Meeting code
            </label>
            <input
              id="code"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full rounded-[4px] border border-input bg-background px-4 py-4 text-center font-mono text-3xl font-semibold uppercase tracking-[0.3em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              maxLength={12}
              aria-describedby={result?.state === "error" ? "code-error" : undefined}
            />
          </div>

          {result?.state === "error" ? (
            <p
              id="code-error"
              className="flex items-center justify-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <XCircle className="size-4 shrink-0" />
              {result.message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            variant="stamp"
            className="w-full"
            disabled={pending || !code.trim()}
          >
            {pending ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Checking in…
              </>
            ) : (
              "Check in"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            An officer reads out the code at the start of each meeting.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
