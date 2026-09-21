"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Search, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { setParticipant, removeParticipant } from "@/lib/actions/admin";
import { gradeLabel } from "@/lib/constants";
import { initials } from "@/lib/utils";
import type { ActivityParticipant, Profile } from "@/lib/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

type Participant = ActivityParticipant & { profile: Profile };

export function ParticipantManager({
  activityId,
  participants,
  members,
  participantIds,
  defaultHours,
}: {
  activityId: string;
  participants: Participant[];
  members: Profile[];
  participantIds: string[];
  defaultHours: number;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const present = new Set(participantIds);
  const sorted = [...participants].sort((a, b) =>
    (a.profile.full_name ?? "").localeCompare(b.profile.full_name ?? ""),
  );

  function remove(memberId: string) {
    setPendingId(memberId);
    startTransition(async () => {
      const res = await removeParticipant(activityId, memberId);
      if (res.ok) {
        toast.success("Removed");
        router.refresh();
      } else toast.error(res.error ?? "Could not remove");
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{participants.length} participants</p>
        <AddParticipantDialog
          activityId={activityId}
          members={members.filter((m) => !present.has(m.id))}
          defaultHours={defaultHours}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No participants yet"
          description="Add the members who took part to award their SSL hours."
        />
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                {p.profile.avatar_url ? <AvatarImage src={p.profile.avatar_url} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {initials(p.profile.full_name ?? p.profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.profile.full_name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {gradeLabel(p.profile.grade).split("·")[0]?.trim()}
                  {p.notes ? ` · ${p.notes}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-display font-semibold">
                {Number(p.ssl_hours_awarded)} hrs
              </span>
              <EditParticipantDialog activityId={activityId} participant={p} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(p.member_id)}
                disabled={pendingId === p.member_id}
                aria-label={`Remove ${p.profile.full_name}`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddParticipantDialog({
  activityId,
  members,
  defaultHours,
}: {
  activityId: string;
  members: Profile[];
  defaultHours: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hours, setHours] = useState(String(defaultHours));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.full_name ?? "").toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [members, query]);

  function add(memberId: string) {
    setPendingId(memberId);
    startTransition(async () => {
      const res = await setParticipant(activityId, memberId, Number(hours) || 0);
      if (res.ok) {
        toast.success("Added");
        router.refresh();
      } else toast.error(res.error ?? "Could not add");
      setPendingId(null);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" /> Add participants
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add participants</DialogTitle>
        </DialogHeader>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-part">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-part"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-28 space-y-2">
            <Label htmlFor="part-hours">Hours</Label>
            <Input
              id="part-hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {members.length === 0 ? "Everyone is already added." : "No members found."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="size-8">
                    {m.avatar_url ? <AvatarImage src={m.avatar_url} alt="" /> : null}
                    <AvatarFallback className="text-xs">
                      {initials(m.full_name ?? m.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => add(m.id)}
                    disabled={pendingId === m.id}
                  >
                    <Check className="size-4" /> Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditParticipantDialog({
  activityId,
  participant,
}: {
  activityId: string;
  participant: Participant;
}) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(String(participant.ssl_hours_awarded));
  const [notes, setNotes] = useState(participant.notes ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    startTransition(async () => {
      const res = await setParticipant(activityId, participant.member_id, Number(hours) || 0, notes);
      if (res.ok) {
        toast.success("Updated");
        setOpen(false);
        router.refresh();
      } else toast.error(res.error ?? "Could not update");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Edit ${participant.profile.full_name}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {participant.profile.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-hours">SSL hours</Label>
            <Input
              id="edit-hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
