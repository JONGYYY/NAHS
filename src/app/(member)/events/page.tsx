import { CalendarDays, MapPin, Palette, Clock } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryColor } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity, Meeting } from "@/lib/types";

type TimelineItem =
  | { kind: "meeting"; date: string; data: Meeting }
  | { kind: "activity"; date: string; data: Activity };

export default async function EventsPage() {
  await requireMember();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [meetingsRes, activitiesRes] = await Promise.all([
    supabase.from("meetings").select("*"),
    supabase.from("activities").select("*"),
  ]);

  const meetings = (meetingsRes.data as Meeting[]) ?? [];
  const activities = (activitiesRes.data as Activity[]) ?? [];

  const items: TimelineItem[] = [
    ...meetings.map((m) => ({ kind: "meeting" as const, date: m.meeting_date, data: m })),
    ...activities.map((a) => ({ kind: "activity" as const, date: a.activity_date, data: a })),
  ];

  const upcoming = items
    .filter((i) => i.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = items
    .filter((i) => i.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedule"
        title="Events"
        description="Upcoming meetings and activities for the chapter, newest first."
      />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing scheduled yet"
            description="New meetings and activities will show up here as admins add them."
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((i) => (
              <EventRow key={`${i.kind}-${i.data.id}`} item={i} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Past</h2>
          <div className="space-y-3">
            {past.slice(0, 20).map((i) => (
              <EventRow key={`${i.kind}-${i.data.id}`} item={i} muted />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function EventRow({ item, muted }: { item: TimelineItem; muted?: boolean }) {
  const isMeeting = item.kind === "meeting";
  const accent = isMeeting
    ? "var(--color-foreground)"
    : categoryColor((item.data as Activity).category);

  return (
    <Card className={muted ? "opacity-70" : undefined}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[4px] border border-border bg-muted">
          {isMeeting ? (
            <CalendarDays className="size-5 text-muted-foreground" />
          ) : (
            <Palette className="size-5" style={{ color: accent }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {isMeeting ? (item.data as Meeting).title : (item.data as Activity).name}
            </p>
            {isMeeting ? (
              <Badge variant="secondary">Meeting</Badge>
            ) : (
              <Badge
                variant="outline"
                style={{ borderColor: accent, color: accent }}
              >
                {(item.data as Activity).category ?? "Activity"}
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatDate(item.date, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {isMeeting && (item.data as Meeting).start_time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatTime((item.data as Meeting).start_time)}
              </span>
            ) : null}
            {isMeeting && (item.data as Meeting).location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {(item.data as Meeting).location}
              </span>
            ) : null}
            {!isMeeting ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {Number((item.data as Activity).ssl_hours_default)} SSL hrs
              </span>
            ) : null}
          </div>
          {item.data.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{item.data.description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
