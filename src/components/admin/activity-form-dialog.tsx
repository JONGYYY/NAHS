"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createActivity, updateActivity } from "@/lib/actions/admin";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";
import type { Activity } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

export function ActivityFormDialog({ activity }: { activity?: Activity }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const editing = Boolean(activity);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing ? await updateActivity(fd) : await createActivity(fd);
      if (res.ok) {
        toast.success(editing ? "Activity updated" : "Activity created");
        setOpen(false);
        router.refresh();
      } else toast.error(res.error ?? "Could not save activity");
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
            <Plus className="size-4" /> New activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit activity" : "New activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {activity ? <input type="hidden" name="id" value={activity.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={activity?.name}
              placeholder="Holiday cards for seniors"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssl_hours_default">Default SSL hours</Label>
            <Input
              id="ssl_hours_default"
              name="ssl_hours_default"
              type="number"
              step="0.5"
              min="0"
              defaultValue={activity?.ssl_hours_default ?? 1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue={activity?.category ?? ACTIVITY_CATEGORIES[0]}
              className="flex h-11 w-full rounded-[4px] border border-input bg-card px-3 text-sm"
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={activity?.description ?? ""}
              placeholder="What's the project about?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Create activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
