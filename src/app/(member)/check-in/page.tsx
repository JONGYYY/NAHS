import { requireMember } from "@/lib/auth";
import { CheckInForm } from "@/components/member/check-in-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  await requireMember();
  const { code } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        eyebrow="Attendance"
        title="Check in"
        description="Enter the code an officer reads out at the meeting to sign the register."
      />
      <CheckInForm initialCode={code ?? ""} />
    </div>
  );
}
