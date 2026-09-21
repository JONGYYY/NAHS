import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Users, Trash2, Palette } from "lucide-react";
import { getActivityDetail } from "@/lib/queries/admin";
import { deleteActivity } from "@/lib/actions/admin";
import { categoryColor, gradeLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityFormDialog } from "@/components/admin/activity-form-dialog";
import { ParticipantManager } from "@/components/admin/participant-manager";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { ExportButton } from "@/components/shared/export-button";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getActivityDetail(id);
  if (!detail) notFound();

  const { activity, participants, participantIds, members } = detail;
  const color = categoryColor(activity.category);
  const totalHours =
    Math.round(participants.reduce((s, p) => s + Number(p.ssl_hours_awarded), 0) * 100) / 100;

  const exportRows = participants.map((p) => [
    p.profile.full_name,
    p.profile.email,
    gradeLabel(p.profile.grade),
    Number(p.ssl_hours_awarded),
    p.notes,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/activities">
            <ArrowLeft className="size-4" /> All activities
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[4px] border border-border bg-muted">
              <Palette className="size-6" style={{ color }} />
            </div>
            <div>
              <p className="eyebrow mb-1">Activity</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {activity.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {activity.category ? (
                  <Badge variant="outline" style={{ borderColor: color, color }}>
                    {activity.category}
                  </Badge>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> {formatDate(activity.activity_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" /> {participants.length} participants
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {totalHours} hrs awarded
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActivityFormDialog activity={activity} />
            <ConfirmButton
              onConfirm={deleteActivity.bind(null, activity.id)}
              title="Delete this activity?"
              description="This removes the activity and everyone's awarded hours for it."
              confirmLabel="Delete activity"
              successMessage="Activity deleted"
              redirectTo="/admin/activities"
              triggerVariant="outline"
              triggerSize="sm"
            >
              <Trash2 className="size-4" /> Delete
            </ConfirmButton>
          </div>
        </div>
        {activity.description ? (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{activity.description}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" /> Participants
          </CardTitle>
          <ExportButton
            filename={`activity-${activity.name.toLowerCase().replace(/\s+/g, "-")}`}
            headers={["Name", "Email", "Grade", "SSL hours", "Notes"]}
            rows={exportRows}
          />
        </CardHeader>
        <CardContent>
          <ParticipantManager
            activityId={activity.id}
            participants={participants}
            members={members}
            participantIds={[...participantIds]}
            defaultHours={Number(activity.ssl_hours_default)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
