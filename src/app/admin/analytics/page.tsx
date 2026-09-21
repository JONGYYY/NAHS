import { TrendingUp, Trophy, Clock, AlertTriangle } from "lucide-react";
import { getAdminData, computeMemberStats } from "@/lib/queries/admin";
import { GRADE_HEX, categoryColor, gradeLabel } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/export-button";
import { SimpleBar, type BarPoint } from "@/components/charts/simple-bar";
import { SimpleDonut, type DonutDatum } from "@/components/charts/simple-donut";

export default async function AdminAnalyticsPage() {
  const data = await getAdminData();
  const statsMap = computeMemberStats(data);
  const today = new Date().toISOString().slice(0, 10);

  const activeStats = [...statsMap.values()].filter((s) => s.profile.status === "active");

  const countByMeeting = new Map<string, number>();
  for (const a of data.attendance)
    countByMeeting.set(a.meeting_id, (countByMeeting.get(a.meeting_id) ?? 0) + 1);

  const heldMeetings = data.meetings
    .filter((m) => m.meeting_date <= today)
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date));

  const attendanceTrend: BarPoint[] = heldMeetings.slice(-12).map((m) => ({
    label: formatDate(m.meeting_date, { month: "short", day: "numeric" }),
    value: countByMeeting.get(m.id) ?? 0,
  }));

  // Average attendance rate by grade
  const gradeAgg = new Map<number, { sum: number; n: number }>();
  for (const s of activeStats) {
    if (!s.profile.grade || s.eligible === 0) continue;
    const cur = gradeAgg.get(s.profile.grade) ?? { sum: 0, n: 0 };
    cur.sum += s.rate;
    cur.n += 1;
    gradeAgg.set(s.profile.grade, cur);
  }
  const rateByGrade: BarPoint[] = [9, 10, 11, 12]
    .filter((g) => gradeAgg.has(g))
    .map((g) => ({
      label: `Grade ${g}`,
      value: Math.round((gradeAgg.get(g)!.sum / gradeAgg.get(g)!.n) || 0),
      color: GRADE_HEX[g],
    }));

  // SSL hours by activity category
  const catById = new Map(data.activities.map((a) => [a.id, a.category ?? "Other"]));
  const hoursByCat = new Map<string, number>();
  for (const p of data.participants) {
    const cat = catById.get(p.activity_id) ?? "Other";
    hoursByCat.set(cat, (hoursByCat.get(cat) ?? 0) + Number(p.ssl_hours_awarded));
  }
  const categoryData: DonutDatum[] = [...hoursByCat.entries()]
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: categoryColor(name),
    }));

  const topAttendees = [...activeStats]
    .filter((s) => s.eligible > 0)
    .sort((a, b) => b.rate - a.rate || b.attended - a.attended)
    .slice(0, 10);
  const sslLeaders = [...activeStats].sort((a, b) => b.sslHours - a.sslHours).slice(0, 10);
  const atRisk = activeStats.filter((s) => s.standing === "at_risk" && s.eligible > 0);

  const atRiskExport = atRisk.map((s) => [
    s.profile.full_name,
    s.profile.email,
    gradeLabel(s.profile.grade),
    `${s.rate}%`,
    s.sslHours,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Attendance trends, grade breakdowns, and leaderboards."
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-muted-foreground" /> Attendance per meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBar data={attendanceTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg attendance rate by grade</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBar data={rateByGrade} suffix="%" height={260} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-muted-foreground" /> SSL hours by category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleDonut data={categoryData} centerLabel="total hrs" suffix=" hrs" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaderboardTable
          title="Attendance leaderboard"
          icon={Trophy}
          rows={topAttendees.map((s) => ({
            profile: s.profile,
            value: `${s.rate}%`,
            detail: `${s.attended}/${s.eligible}`,
          }))}
        />
        <LeaderboardTable
          title="SSL hours leaderboard"
          icon={Clock}
          rows={sslLeaders.map((s) => ({
            profile: s.profile,
            value: `${s.sslHours} hrs`,
            detail: gradeLabel(s.profile.grade).split("·")[0]?.trim() ?? "",
          }))}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-warning" /> Members at risk ({atRisk.length})
          </CardTitle>
          <ExportButton
            filename="members-at-risk"
            headers={["Name", "Email", "Grade", "Attendance rate", "SSL hours"]}
            rows={atRiskExport}
          />
        </CardHeader>
        <CardContent>
          {atRisk.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Everyone is meeting the requirements.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {atRisk.map((s) => (
                <li
                  key={s.profile.id}
                  className="flex items-center justify-between gap-2 rounded-[4px] border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{gradeLabel(s.profile.grade)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary">{s.rate}%</Badge>
                    <Badge variant="secondary">{s.sslHours} hrs</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardTable({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Trophy;
  rows: {
    profile: { full_name: string | null; email: string; avatar_url: string | null };
    value: string;
    detail: string;
  }[];
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
          <ol className="space-y-2.5">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                <Avatar className="size-8">
                  {r.profile.avatar_url ? <AvatarImage src={r.profile.avatar_url} alt="" /> : null}
                  <AvatarFallback className="text-xs">
                    {initials(r.profile.full_name ?? r.profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.profile.full_name ?? r.profile.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
                </div>
                <span className="text-sm font-semibold">{r.value}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
