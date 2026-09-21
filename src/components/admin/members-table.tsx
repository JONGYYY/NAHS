"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Search,
  CheckCircle2,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  Pencil,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  setMemberStatus,
  setMemberRole,
  updateMember,
  addSslAdjustment,
} from "@/lib/actions/admin";
import type { MemberStat } from "@/lib/queries/admin";
import { GRADES, gradeLabel } from "@/lib/constants";
import { initials } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filter = "all" | "pending" | "active" | "inactive" | "admin";

export function MembersTable({
  members,
  initialFilter = "all",
}: {
  members: MemberStat[];
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const pendingCount = members.filter((m) => m.profile.status === "pending").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filter === "admin" && m.profile.role !== "admin") return false;
      if (filter !== "all" && filter !== "admin" && m.profile.status !== filter) return false;
      if (!q) return true;
      return (
        (m.profile.full_name ?? "").toLowerCase().includes(q) ||
        m.profile.email.toLowerCase().includes(q)
      );
    });
  }, [members, filter, query]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        router.refresh();
      } else toast.error(res.error ?? "Something went wrong");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">
              Pending{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[6px] border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>SSL hrs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No members match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {m.profile.avatar_url ? (
                          <AvatarImage src={m.profile.avatar_url} alt="" />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {initials(m.profile.full_name ?? m.profile.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium">{m.profile.full_name}</span>
                          {m.profile.role === "admin" ? (
                            <Shield className="size-3.5 text-muted-foreground" />
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.profile.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {m.profile.grade ? `Grade ${m.profile.grade}` : "Unlisted"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{m.rate}%</span>
                      {m.eligible > 0 && m.standing === "at_risk" ? (
                        <span className="size-2 rounded-full bg-warning" title="Below goal" />
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {m.attended}/{m.eligible}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{m.sslHours}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.profile.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions member={m} run={run} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <Badge variant="success">Active</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="secondary">Inactive</Badge>;
}

function RowActions({
  member,
  run,
}: {
  member: MemberStat;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [sslOpen, setSslOpen] = useState(false);
  const p = member.profile;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Member actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {p.status === "pending" ? (
            <DropdownMenuItem onClick={() => run(() => setMemberStatus(p.id, "active"), "Approved")}>
              <CheckCircle2 /> Approve member
            </DropdownMenuItem>
          ) : null}
          {p.status !== "active" ? (
            <DropdownMenuItem onClick={() => run(() => setMemberStatus(p.id, "active"), "Set active")}>
              <UserCheck /> Set active
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => run(() => setMemberStatus(p.id, "inactive"), "Set inactive")}
            >
              <UserX /> Set inactive
            </DropdownMenuItem>
          )}
          {p.role === "admin" ? (
            <DropdownMenuItem onClick={() => run(() => setMemberRole(p.id, "member"), "Admin removed")}>
              <ShieldOff /> Remove admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => run(() => setMemberRole(p.id, "admin"), "Now an admin")}>
              <Shield /> Make admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil /> Edit details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSslOpen(true)}>
            <Clock /> Adjust SSL hours
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMemberDialog member={p} open={editOpen} onOpenChange={setEditOpen} />
      <SslDialog member={p} open={sslOpen} onOpenChange={setSslOpen} />
    </>
  );
}

function EditMemberDialog({
  member,
  open,
  onOpenChange,
}: {
  member: MemberStat["profile"];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateMember(fd);
      if (res.ok) {
        toast.success("Member updated");
        onOpenChange(false);
        router.refresh();
      } else toast.error(res.error ?? "Could not update");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" name="id" value={member.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${member.id}`}>Full name</Label>
            <Input
              id={`name-${member.id}`}
              name="full_name"
              defaultValue={member.full_name ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`grade-${member.id}`}>Grade</Label>
            <select
              id={`grade-${member.id}`}
              name="grade"
              defaultValue={member.grade ?? ""}
              className="flex h-11 w-full rounded-[4px] border border-input bg-card px-3 text-sm"
              required
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SslDialog({
  member,
  open,
  onOpenChange,
}: {
  member: MemberStat["profile"];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addSslAdjustment(fd);
      if (res.ok) {
        toast.success("SSL hours adjusted");
        onOpenChange(false);
        router.refresh();
      } else toast.error(res.error ?? "Could not adjust");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust SSL hours</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" name="member_id" value={member.id} />
          <p className="text-sm text-muted-foreground">
            Add or remove hours for {member.full_name}. Use a negative number to subtract.
          </p>
          <div className="space-y-2">
            <Label htmlFor={`hours-${member.id}`}>Hours</Label>
            <Input
              id={`hours-${member.id}`}
              name="hours"
              type="number"
              step="0.5"
              placeholder="2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`reason-${member.id}`}>Reason</Label>
            <Input
              id={`reason-${member.id}`}
              name="reason"
              placeholder="Helped set up gallery night"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
