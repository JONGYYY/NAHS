import { getAdminData, computeMemberStats } from "@/lib/queries/admin";
import { gradeLabel } from "@/lib/constants";
import { PageHeader } from "@/components/shared/page-header";
import { MembersTable } from "@/components/admin/members-table";
import { ExportButton } from "@/components/shared/export-button";

type Filter = "all" | "pending" | "active" | "inactive" | "admin";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const data = await getAdminData();
  const statsMap = computeMemberStats(data);
  const members = [...statsMap.values()].sort((a, b) =>
    (a.profile.full_name ?? "").localeCompare(b.profile.full_name ?? ""),
  );

  const valid: Filter[] = ["all", "pending", "active", "inactive", "admin"];
  const initialFilter = valid.includes(filter as Filter) ? (filter as Filter) : "all";

  const exportRows = members.map((m) => [
    m.profile.full_name,
    m.profile.email,
    gradeLabel(m.profile.grade),
    m.profile.status,
    m.profile.role,
    `${m.rate}%`,
    `${m.attended}/${m.eligible}`,
    m.sslHours,
    m.standing === "good" ? "Good standing" : "At risk",
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry"
        title="Members"
        description="Approve sign-ups, manage roles, and track each member's record."
      >
        <ExportButton
          filename="nahs-members"
          headers={[
            "Name",
            "Email",
            "Grade",
            "Status",
            "Role",
            "Attendance rate",
            "Attended",
            "SSL hours",
            "Standing",
          ]}
          rows={exportRows}
        />
      </PageHeader>

      <MembersTable members={members} initialFilter={initialFilter} />
    </div>
  );
}
