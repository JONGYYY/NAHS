import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, CalendarDays, Trash2, Users } from "lucide-react";
import { getMeetingDetail } from "@/lib/queries/admin";
import { deleteMeeting } from "@/lib/actions/admin";
import { formatDate, formatTime } from "@/lib/utils";
import { gradeLabel } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingFormDialog } from "@/components/admin/meeting-form-dialog";
import { MeetingCodePanel } from "@/components/admin/meeting-code-panel";
import { AttendanceManager } from "@/components/admin/attendance-manager";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { ExportButton } from "@/components/shared/export-button";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getMeetingDetail(id);
  if (!detail) notFound();

  const { meeting, code, attendees, presentIds, members } = detail;

  const exportRows = attendees.map((a) => [
    a.profile.full_name,
    a.profile.email,
    a.profile.grade,
    gradeLabel(a.profile.grade),
    a.method,
    new Date(a.checked_in_at).toLocaleString(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/admin/meetings">
            <ArrowLeft className="size-4" /> All meetings
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">Meeting</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {meeting.title}
            </h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDate(meeting.meeting_date, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {meeting.start_time ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {formatTime(meeting.start_time)}
                  {meeting.end_time ? ` – ${formatTime(meeting.end_time)}` : ""}
                </span>
              ) : null}
              {meeting.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {meeting.location}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MeetingFormDialog meeting={meeting} />
            <ConfirmButton
              onConfirm={deleteMeeting.bind(null, meeting.id)}
              title="Delete this meeting?"
              description="This permanently removes the meeting and its attendance records."
              confirmLabel="Delete meeting"
              successMessage="Meeting deleted"
              redirectTo="/admin/meetings"
              triggerVariant="outline"
              triggerSize="sm"
            >
              <Trash2 className="size-4" /> Delete
            </ConfirmButton>
          </div>
        </div>
        {meeting.description ? (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{meeting.description}</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Check-in code</CardTitle>
          </CardHeader>
          <CardContent>
            <MeetingCodePanel meetingId={meeting.id} code={code} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" /> Attendees
            </CardTitle>
            <ExportButton
              filename={`attendance-${meeting.meeting_date}`}
              headers={["Name", "Email", "Grade", "Grade label", "Method", "Checked in"]}
              rows={exportRows}
            />
          </CardHeader>
          <CardContent>
            <AttendanceManager
              meetingId={meeting.id}
              attendees={attendees}
              members={members}
              presentIds={presentIds ? [...presentIds] : []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
