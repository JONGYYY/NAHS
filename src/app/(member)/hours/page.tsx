import { Clock, Palette, Hourglass, Target } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { getMemberActivities, getMemberOverview } from "@/lib/queries/member";
import { categoryColor } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoursDonut, type DonutSlice } from "@/components/charts/hours-donut";

export default async function HoursPage() {
  const profile = await requireMember();
  const [overview, { participants, adjustments }] = await Promise.all([
    getMemberOverview(profile.id, profile.join_date),
    getMemberActivities(profile.id),
  ]);

  // Group hours by activity category for the donut.
  const byCategory = new Map<string, number>();
  for (const p of participants) {
    const cat = p.activity?.category ?? "Other";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(p.ssl_hours_awarded));
  }
  const adjTotal = adjustments.reduce((s, a) => s + Number(a.hours), 0);
  if (adjTotal !== 0) byCategory.set("Adjustments", (byCategory.get("Adjustments") ?? 0) + adjTotal);

  const slices: DonutSlice[] = [...byCategory.entries()]
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: name === "Adjustments" ? "#71717a" : categoryColor(name),
    }));

  const remaining = Math.max(0, overview.settings.required_ssl_hours - overview.sslHours);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title="SSL hours and activities"
        description="Every project and service-learning hour you have earned, totaled for you."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total SSL hours"
          value={overview.sslHours}
          icon={Clock}
          accent="var(--color-pigment-cadmium)"
        />
        <StatCard
          label="Goal"
          value={`${overview.settings.required_ssl_hours}`}
          sub="hours"
          icon={Target}
          accent="var(--color-pigment-ultramarine)"
        />
        <StatCard
          label="Remaining"
          value={remaining}
          sub={remaining === 0 ? "Goal met" : "to reach goal"}
          icon={Hourglass}
          accent="var(--color-pigment-viridian)"
        />
        <StatCard
          label="Activities"
          value={participants.length}
          sub="joined"
          icon={Palette}
          accent="var(--color-pigment-violet)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hours by category</CardTitle>
          </CardHeader>
          <CardContent>
            <HoursDonut data={slices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <EmptyState
                icon={Palette}
                title="No activities yet"
                description="When you join a project like holiday cards or a mural, it'll appear here with the SSL hours you earned."
              />
            ) : (
              <ul className="divide-y divide-border">
                {participants.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {p.activity?.name ?? "Activity"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {p.activity?.category ? (
                          <Badge
                            variant="outline"
                            className="gap-1"
                            style={{
                              borderColor: categoryColor(p.activity.category),
                              color: categoryColor(p.activity.category),
                            }}
                          >
                            {p.activity.category}
                          </Badge>
                        ) : null}
                        <span>{formatDate(p.activity?.activity_date)}</span>
                      </div>
                    </div>
                    <span className="shrink-0 font-display font-semibold">
                      {Number(p.ssl_hours_awarded)} hrs
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {adjustments.length > 0 ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="eyebrow mb-2">Manual adjustments</p>
                <ul className="space-y-2">
                  {adjustments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {a.reason || "Adjustment"} · {formatDate(a.created_at)}
                      </span>
                      <span
                        className={
                          Number(a.hours) >= 0 ? "font-medium text-success" : "font-medium text-destructive"
                        }
                      >
                        {Number(a.hours) >= 0 ? "+" : ""}
                        {Number(a.hours)} hrs
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
