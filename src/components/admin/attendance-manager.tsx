"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { addAttendance, removeAttendance } from "@/lib/actions/admin";
import { gradeLabel } from "@/lib/constants";
import { formatTime, initials } from "@/lib/utils";
import type { Attendance, Profile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

type Attendee = Attendance & { profile: Profile };

export function AttendanceManager({
  meetingId,
  attendees,
  members,
  presentIds,
}: {
  meetingId: string;
  attendees: Attendee[];
  members: Profile[];
  presentIds: string[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function remove(memberId: string) {
    setPendingId(memberId);
    startTransition(async () => {
      const res = await removeAttendance(meetingId, memberId);
      if (res.ok) {
        toast.success("Removed");
        router.refresh();
      } else toast.error(res.error ?? "Could not remove");
      setPendingId(null);
    });
  }

  const present = new Set(presentIds);
  const sorted = [...attendees].sort((a, b) =>
    (a.profile.full_name ?? "").localeCompare(b.profile.full_name ?? ""),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {attendees.length} present
        </p>
        <AddAttendeeDialog
          meetingId={meetingId}
          members={members.filter((m) => !present.has(m.id))}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No attendees yet"
          description="Members appear here as they check in, or add them manually."
        />
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                {a.profile.avatar_url ? <AvatarImage src={a.profile.avatar_url} alt="" /> : null}
                <AvatarFallback className="text-xs">
                  {initials(a.profile.full_name ?? a.profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.profile.full_name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {a.profile.email} · {gradeLabel(a.profile.grade).split("·")[0]?.trim()}
                </p>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <div>{formatTime(new Date(a.checked_in_at).toTimeString().slice(0, 8))}</div>
                <Badge variant={a.method === "manual" ? "secondary" : "success"}>
                  {a.method === "manual" ? "Manual" : "Code"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(a.member_id)}
                disabled={pendingId === a.member_id}
                aria-label={`Remove ${a.profile.full_name}`}
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

function AddAttendeeDialog({
  meetingId,
  members,
}: {
  meetingId: string;
  members: Profile[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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
      const res = await addAttendance(meetingId, memberId);
      if (res.ok) {
        toast.success("Marked present");
        router.refresh();
      } else toast.error(res.error ?? "Could not add");
      setPendingId(null);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="size-4" /> Add manually
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add attendee</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="pl-9"
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {members.length === 0 ? "Everyone is already present." : "No members found."}
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
