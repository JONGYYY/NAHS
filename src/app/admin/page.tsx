import Link from "next/link";
import {
  Users,
  UserPlus,
  CalendarCheck,
  TrendingUp,
  Clock,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { getAdminData, computeMemberStats } from "@/lib/queries/admin";
import { GRADE_HEX, gradeLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimpleBar, type BarPoint } from "@/components/charts/simple-bar";
import { SimpleDonut, type DonutDatum } from "@/components/charts/simple-donut";
import { initials } from "@/lib/utils";

export default async function AdminDashboard() {
  const data = await getAdminData();
  const stats = computeMemberStats(data);
  const today = new Date().toISOString().slice(0, 10);

  const active = data.profiles.filter((p) => p.status === "active");
  const pending = data.profiles.filter((p) => p.status === "pending");
  const heldMeetings = data.meetings.filter((m) => m.meeting_date <= today);

  const countByMeeting = new Map<string, number>();
  for (const a of data.attendance) {
    countByMeeting.set(a.meeting_id, (countByMeeting.get(a.meeting_id) ?? 0) + 1);
  }
  const avgAttendance =
    heldMeetings.length > 0
      ? Math.round(
          heldMeetings.reduce((s, m) => s + (countByMeeting.get(m.id) ?? 0), 0) /
            heldMeetings.length,
        )
      : 0;

  const totalSsl =
    Math.round(
      ([...stats.values()].reduce((s, m) => s + m.sslHours, 0)) * 100,
    ) / 100;

  // Attendance per meeting (last 8 held)
  const trend: BarPoint[] = [...heldMeetings]
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))
    .slice(-8)
    .map((m) => ({
      label: formatDate(m.meeting_date, { month: "short", day: "numeric" }),
      value: countByMeeting.get(m.id) ?? 0,
    }));

  // Members by grade (active)
  const gradeCounts = new Map<number, number>();
  for (const p of active) {
    if (p.grade) gradeCounts.set(p.grade, (gradeCounts.get(p.grade) ?? 0) + 1);
  }
  const gradeData: DonutDatum[] = [9, 10, 11, 12]
    .filter((g) => (gradeCounts.get(g) ?? 0) > 0)
    .map((g) => ({
      name: `Grade ${g}`,
      value: gradeCounts.get(g) ?? 0,
      color: GRADE_HEX[g],
    }));

  const activeStats = [...stats.values()].filter((s) => s.profile.status === "active");
  const topAttendees = [...activeStats]
    .filter((s) => s.eligible > 0)
    .sort((a, b) => b.rate - a.rate || b.attended - a.attended)
    .slice(0, 5);
  const sslLeaders = [...activeStats].sort((a, b) => b.sslHours - a.sslHours).slice(0, 5);
  const atRisk = activeStats.filter((s) => s.standing === "at_risk" && s.eligible > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={`${data.settings.club_name}. Attendance and activity at a glance.`}
      />

      {pending.length > 0 ? (
        <Card className="bg-accent">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[4px] border border-border bg-card">
                <UserPlus className="size-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {pending.length} member{pending.length > 1 ? "s" : ""} waiting for approval
                </p>
                <p className="text-sm text-muted-foreground">Review and approve new sign-ups.</p>
              </div>
            </div>
            <Button asChild size="sm" variant="stamp">
              <Link href="/admin/members?filter=pending">Review sign-ups</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active members"
          value={active.length}
          icon={Users}
          accent="var(--color-pigment-ultramarine)"
        />
        <StatCard
          label="Meetings held"
          value={heldMeetings.length}
          icon={CalendarCheck}
          accent="var(--color-pigment-viridian)"
        />
        <StatCard
          label="Avg attendance"
          value={avgAttendance}
          sub="per meeting"
          icon={TrendingUp}
          accent="var(--color-pigment-violet)"
        />
        <StatCard
          label="SSL hours awarded"
          value={totalSsl}
          icon={Clock}
          accent="var(--color-pigment-cadmium)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance per meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBar data={trend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Members by grade</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleDonut data={gradeData} centerValue={active.length} centerLabel="members" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Leaderboard
          title="Top attendance"
          icon={Trophy}
          rows={topAttendees.map((s) => ({
            profile: s.profile,
            primary: `${s.rate}%`,
            secondary: `${s.attended}/${s.eligible}`,
          }))}
        />
        <Leaderboard
          title="SSL hours leaders"
          icon={Clock}
          rows={sslLeaders.map((s) => ({
            profile: s.profile,
            primary: `${s.sslHours}`,
            secondary: "hrs",
          }))}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-warning" /> Members at risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atRisk.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Everyone is meeting requirements.
              </p>
            ) : (
              <ul className="space-y-3">
                {atRisk.slice(0, 6).map((s) => (
                  <li key={s.profile.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{gradeLabel(s.profile.grade)}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{s.rate}% att.</div>
                      <div>{s.sslHours} hrs</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Leaderboard({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Trophy;
  rows: { profile: { full_name: string | null; avatar_url: string | null; email: string }; primary: string; secondary: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={Icon} title="No data yet" className="border-0 py-6" />
        ) : (
          <ol className="space-y-3">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                <Avatar className="size-8">
                  {r.profile.avatar_url ? (
                    <AvatarImage src={r.profile.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {initials(r.profile.full_name ?? r.profile.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {r.profile.full_name ?? r.profile.email}
                </span>
                <span className="text-sm font-semibold">
                  {r.primary}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{r.secondary}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
