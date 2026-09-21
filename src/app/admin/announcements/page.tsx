import { Megaphone, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteAnnouncement } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import type { Announcement } from "@/lib/types";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  const announcements = (data as Announcement[]) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notices"
        title="Announcements"
        description="Post updates that appear on every member's dashboard."
      />

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">New announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Your posts will show up here and on member dashboards."
            />
          ) : (
            announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    {a.body ? (
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                        {a.body}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(a.created_at, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <ConfirmButton
                    onConfirm={deleteAnnouncement.bind(null, a.id)}
                    title="Delete announcement?"
                    confirmLabel="Delete"
                    successMessage="Deleted"
                    triggerVariant="ghost"
                    triggerSize="icon"
                    triggerAriaLabel="Delete announcement"
                  >
                    <Trash2 className="size-4" />
                  </ConfirmButton>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
