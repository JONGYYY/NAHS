"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createMeeting, updateMeeting } from "@/lib/actions/admin";
import type { Meeting } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Local-time YYYY-MM-DD, so the date defaults to the admin's current day.
function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function MeetingFormDialog({ meeting }: { meeting?: Meeting }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const editing = Boolean(meeting);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing ? await updateMeeting(fd) : await createMeeting(fd);
      if (res.ok) {
        toast.success(editing ? "Meeting updated" : "Meeting created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save meeting");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> New meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit meeting" : "New meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {meeting ? <input type="hidden" name="id" value={meeting.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={meeting?.title ?? "Weekly Meeting"}
              placeholder="Weekly Meeting"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting_date">Date</Label>
            <Input
              id="meeting_date"
              name="meeting_date"
              type="date"
              defaultValue={meeting?.meeting_date ?? todayISO()}
              required
            />
            <p className="text-xs text-muted-foreground">
              Defaults to today. Meetings run weekly on Tuesdays &mdash; change the date if needed.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Create meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
