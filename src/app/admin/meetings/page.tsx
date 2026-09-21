import Link from "next/link";
import { CalendarDays, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import { getMeetingsWithCounts } from "@/lib/queries/admin";
import { formatDate, formatTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MeetingFormDialog } from "@/components/admin/meeting-form-dialog";

export default async function AdminMeetingsPage() {
  const meetings = await getMeetingsWithCounts();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Meetings"
        description="Create meetings and open check-in with a code members enter."
      >
        <MeetingFormDialog />
      </PageHeader>

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No meetings yet"
          description="Create your first meeting, then generate a code so members can check in."
        >
          <MeetingFormDialog />
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const upcoming = m.meeting_date >= today;
            const codeActive =
              m.code?.is_active &&
              (!m.code.expires_at || new Date(m.code.expires_at) > new Date());
            return (
              <Link key={m.id} href={`/admin/meetings/${m.id}`}>
                <Card className="transition-colors hover:border-foreground/40">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-[4px] border border-border bg-muted text-foreground">
                      <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {formatDate(m.meeting_date, { month: "short" })}
                      </span>
                      <span className="font-display text-lg font-bold leading-none">
                        {new Date(m.meeting_date).getUTCDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{m.title}</p>
                        {upcoming ? (
                          <Badge variant="secondary">Upcoming</Badge>
                        ) : null}
                        {codeActive ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="size-3" /> Check-in open
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDate(m.meeting_date, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {m.start_time ? ` · ${formatTime(m.start_time)}` : ""}
                        {m.location ? ` · ${m.location}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="size-4" />
                      {m.attendee_count}
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
