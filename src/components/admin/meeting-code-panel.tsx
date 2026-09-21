"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { generateCode, setCodeActive } from "@/lib/actions/admin";
import type { AttendanceCode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function MeetingCodePanel({
  meetingId,
  code,
}: {
  meetingId: string;
  code: AttendanceCode | null;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const expired = code?.expires_at ? new Date(code.expires_at).getTime() < now : false;
  const remainingMs = code?.expires_at ? new Date(code.expires_at).getTime() - now : 0;
  const remaining =
    remainingMs > 0
      ? `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`
      : "expired";

  const checkInUrl =
    typeof window !== "undefined" && code
      ? `${window.location.origin}/check-in?code=${code.code}`
      : "";

  function regenerate() {
    startTransition(async () => {
      const res = await generateCode(meetingId);
      if (res.ok) {
        toast.success("New code generated");
        router.refresh();
      } else toast.error(res.error ?? "Could not generate code");
    });
  }

  function toggle(active: boolean) {
    startTransition(async () => {
      const res = await setCodeActive(meetingId, active);
      if (res.ok) {
        toast.success(active ? "Check-in opened" : "Check-in closed");
        router.refresh();
      } else toast.error(res.error ?? "Could not update");
    });
  }

  function copy() {
    if (!code) return;
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!code) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-[6px] border border-border bg-muted">
          <KeyRound className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No check-in code yet</p>
          <p className="text-sm text-muted-foreground">
            Generate a code and share it at the meeting so members can check in.
          </p>
        </div>
        <Button onClick={regenerate} disabled={pending}>
          <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} /> Generate code
        </Button>
      </div>
    );
  }

  const isOpen = code.is_active && !expired;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="eyebrow">Meeting code</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-4xl font-semibold tracking-[0.15em]">{code.code}</span>
            <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy code">
              {copied ? <Check className="size-5 text-success" /> : <Copy className="size-5" />}
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {expired ? (
              <span className="text-destructive">Code expired. Generate a new one.</span>
            ) : (
              <>Expires in {remaining}</>
            )}
          </p>
        </div>
        <div className="rounded-[4px] border border-border bg-white p-3">
          <QRCodeSVG value={checkInUrl || code.code} size={104} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[4px] border border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Check-in {isOpen ? "open" : "closed"}</p>
          <p className="text-xs text-muted-foreground">
            {isOpen ? "Members can check in with this code." : "Members cannot check in."}
          </p>
        </div>
        <Switch
          checked={code.is_active && !expired}
          onCheckedChange={toggle}
          disabled={pending || expired}
          aria-label="Toggle check-in"
        />
      </div>

      <Button variant="outline" onClick={regenerate} disabled={pending} className="w-full">
        <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} /> Regenerate code
      </Button>
    </div>
  );
}
