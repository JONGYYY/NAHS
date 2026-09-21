"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/admin";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSettings(fd);
      if (res.ok) {
        toast.success("Settings saved");
        router.refresh();
      } else toast.error(res.error ?? "Could not save");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Chapter</h2>
          <p className="text-sm text-muted-foreground">Basic details about your chapter.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="club_name">Chapter name</Label>
            <Input id="club_name" name="club_name" defaultValue={settings.club_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting_day">Meeting day</Label>
            <select
              id="meeting_day"
              name="meeting_day"
              defaultValue={settings.meeting_day}
              className="flex h-11 w-full rounded-[4px] border border-input bg-card px-3 text-sm"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Requirements</h2>
          <p className="text-sm text-muted-foreground">
            Thresholds used to decide who is in good standing.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="required_attendance_pct">Required attendance (%)</Label>
            <Input
              id="required_attendance_pct"
              name="required_attendance_pct"
              type="number"
              min="0"
              max="100"
              defaultValue={settings.required_attendance_pct}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="required_ssl_hours">Required SSL hours</Label>
            <Input
              id="required_ssl_hours"
              name="required_ssl_hours"
              type="number"
              step="0.5"
              min="0"
              defaultValue={settings.required_ssl_hours}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Check-in codes</h2>
          <p className="text-sm text-muted-foreground">
            Controls the codes members enter to check in.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code_length">Code length</Label>
            <Input
              id="code_length"
              name="code_length"
              type="number"
              min="4"
              max="10"
              defaultValue={settings.code_length}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code_window_minutes">Code active window (minutes)</Label>
            <Input
              id="code_window_minutes"
              name="code_window_minutes"
              type="number"
              min="5"
              defaultValue={settings.code_window_minutes}
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={pending}>
        <Save className="size-4" /> {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
