import Link from "next/link";
import {
  CalendarDays,
  Percent,
  Clock,
  Flame,
  Megaphone,
  MapPin,
  QrCode,
} from "lucide-react";
import { requireMember } from "@/lib/auth";
import { getMemberOverview } from "@/lib/queries/member";
import { formatDate, formatTime } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const profile = await requireMember();
  const o = await getMemberOverview(profile.id, profile.join_date);
  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="eyebrow">
            {formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Hello, {firstName}
          </h1>
        </div>
        {o.standing === "good" ? (
          <Badge variant="success">Good standing</Badge>
        ) : (
          <Badge variant="warning">Below requirements</Badge>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[1.5fr_1fr]">
          <CardContent className="flex flex-col justify-between gap-5 p-6">
            <div>
              <p className="eyebrow">{o.nextMeeting ? "Next meeting" : "Check in"}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
                {o.nextMeeting ? o.nextMeeting.title : "Enter your meeting code"}
              </h2>
              {o.nextMeeting ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {formatDate(o.nextMeeting.meeting_date, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {o.nextMeeting.start_time ? ` · ${formatTime(o.nextMeeting.start_time)}` : ""}
                  </span>
                  {o.nextMeeting.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {o.nextMeeting.location}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  When an officer opens check-in, enter the code they read out to mark your
                  attendance.
                </p>
              )}
            </div>
            <Button asChild size="lg" variant="stamp" className="w-full sm:w-fit">
              <Link href="/check-in">Open check-in</Link>
            </Button>
          </CardContent>
          <div className="hidden flex-col items-center justify-center gap-3 border-l border-border bg-muted p-6 sm:flex">
            <QrCode className="size-12 text-muted-foreground" aria-hidden="true" />
            <p className="eyebrow text-center">Have the code ready</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${o.attendanceStats.rate}%`}
          sub={`${o.attendanceStats.attended} of ${o.attendanceStats.eligible} meetings`}
          icon={Percent}
          accent="var(--color-pigment-ultramarine)"
        />
        <StatCard
          label="SSL hours"
          value={o.sslHours}
          sub={`Goal: ${o.settings.required_ssl_hours} hrs`}
          icon={Clock}
          accent="var(--color-pigment-cadmium)"
        />
        <StatCard
          label="Current streak"
          value={o.attendanceStats.currentStreak}
          sub={`Longest: ${o.attendanceStats.longestStreak}`}
          icon={Flame}
          accent="var(--color-pigment-alizarin)"
        />
        <StatCard
          label="Meetings attended"
          value={o.attendanceStats.attended}
          sub={`Since ${formatDate(profile.join_date, { month: "short", year: "numeric" })}`}
          icon={CalendarDays}
          accent="var(--color-pigment-viridian)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-4 text-muted-foreground" /> Latest announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {o.latestAnnouncement ? (
              <div>
                <p className="font-medium">{o.latestAnnouncement.title}</p>
                {o.latestAnnouncement.body ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {o.latestAnnouncement.body}
                  </p>
                ) : null}
                <p className="eyebrow mt-3">{formatDate(o.latestAnnouncement.created_at)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing posted yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where you stand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressRow
              label="Attendance"
              value={o.attendanceStats.rate}
              target={o.settings.required_attendance_pct}
              suffix="%"
              color="var(--color-pigment-ultramarine)"
            />
            <ProgressRow
              label="SSL hours"
              value={o.sslHours}
              target={o.settings.required_ssl_hours}
              suffix=" hrs"
              color="var(--color-pigment-cadmium)"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  target,
  suffix,
  color,
}: {
  label: string;
  value: number;
  target: number;
  suffix: string;
  color: string;
}) {
  const filled = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 100;
  const met = value >= target;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={met ? "font-medium text-success" : "text-muted-foreground"}>
          {value}
          {suffix} / {target}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-[2px] bg-muted">
        <div
          className="h-full transition-all"
          style={{ width: `${filled}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
