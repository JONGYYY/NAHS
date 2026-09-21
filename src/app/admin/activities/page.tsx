import Link from "next/link";
import { Palette, Users, Clock, ChevronRight } from "lucide-react";
import { getActivitiesWithCounts } from "@/lib/queries/admin";
import { categoryColor } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityFormDialog } from "@/components/admin/activity-form-dialog";

export default async function AdminActivitiesPage() {
  const activities = await getActivitiesWithCounts();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Activities"
        description="Projects like holiday cards or murals. Award SSL hours to the members who took part."
      >
        <ActivityFormDialog />
      </PageHeader>

      {activities.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No activities yet"
          description="Create a project, then add the members who participated and award their SSL hours."
        >
          <ActivityFormDialog />
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {activities.map((a) => {
            const color = categoryColor(a.category);
            return (
              <Link key={a.id} href={`/admin/activities/${a.id}`}>
                <Card className="h-full transition-colors hover:border-foreground/40">
                  <CardContent className="flex h-full items-start gap-4 p-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[4px] border border-border bg-muted">
                      <Palette className="size-5" style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{a.name}</p>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                      </div>
                      {a.category ? (
                        <Badge
                          variant="outline"
                          className="mt-1"
                          style={{ borderColor: color, color }}
                        >
                          {a.category}
                        </Badge>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatDate(a.activity_date)}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-4" /> {a.participant_count}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-4" /> {a.total_hours} hrs
                        </span>
                      </div>
                    </div>
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
