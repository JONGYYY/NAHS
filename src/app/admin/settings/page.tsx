import { getSettings } from "@/lib/queries/member";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Your chapter name, membership requirements, and check-in codes."
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
