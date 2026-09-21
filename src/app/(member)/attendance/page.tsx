import { Percent, CalendarDays, Flame, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { getMemberOverview } from "@/lib/queries/member";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MemberAttendanceChart,
  type AttendancePoint,
} from "@/components/charts/member-attendance-chart";

export default async function AttendancePage() {
  const profile = await requireMember();
  const o = await getMemberOverview(profile.id, profile.join_date);

  const asc = [...o.eligibleMeetings].sort((a, b) =>
    a.meeting_date.localeCompare(b.meeting_date),
  );

  const presentFlags = asc.map((m) => (o.attendedMeetingIds.has(m.id) ? 1 : 0));
  const points: AttendancePoint[] = asc.map((m, i) => {
    const attendedSoFar = presentFlags.slice(0, i + 1).reduce<number>((s, v) => s + v, 0);
    return {
      label: formatDate(m.meeting_date, { month: "short", day: "numeric" }),
      rate: Math.round((attendedSoFar / (i + 1)) * 100),
      present: presentFlags[i],
    };
  });

  const history = [...o.eligibleMeetings].sort((a, b) =>
    b.meeting_date.localeCompare(a.meeting_date),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your record"
        title="My attendance"
        description="Every meeting you were eligible for, your streaks, and where your standing sits."
      >
        {o.standing === "good" ? (
          <Badge variant="success">Good standing</Badge>
        ) : (
          <Badge variant="warning">Below {o.settings.required_attendance_pct}% goal</Badge>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${o.attendanceStats.rate}%`}
          sub={`Goal: ${o.settings.required_attendance_pct}%`}
          icon={Percent}
          accent="var(--color-pigment-ultramarine)"
        />
        <StatCard
          label="Attended"
          value={`${o.attendanceStats.attended}/${o.attendanceStats.eligible}`}
          sub="meetings"
          icon={CalendarDays}
          accent="var(--color-pigment-viridian)"
        />
        <StatCard
          label="Current streak"
          value={o.attendanceStats.currentStreak}
          sub="in a row"
          icon={Flame}
          accent="var(--color-pigment-alizarin)"
        />
        <StatCard
          label="Longest streak"
          value={o.attendanceStats.longestStreak}
          sub="personal best"
          icon={Trophy}
          accent="var(--color-pigment-violet)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance rate over time</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberAttendanceChart data={points} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No meetings yet"
              description="Once meetings are held, your attendance record will show up here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {history.map((m) => {
                const present = o.attendedMeetingIds.has(m.id);
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(m.meeting_date, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {present ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="size-3.5" /> Present
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-muted-foreground">
                        <XCircle className="size-3.5" /> Missed
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
