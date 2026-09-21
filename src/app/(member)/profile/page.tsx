import { CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getMemberOverview } from "@/lib/queries/member";
import { gradeLabel } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/member/profile-form";

export default async function ProfilePage() {
  const profile = await requireMember();
  const o = await getMemberOverview(profile.id, profile.join_date);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Your details and where your membership stands."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="size-20">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {initials(profile.full_name ?? profile.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-xl font-semibold">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">{gradeLabel(profile.grade)}</Badge>
              {profile.role === "admin" ? (
                <Badge className="gap-1">
                  <Shield className="size-3" /> Admin
                </Badge>
              ) : null}
              {o.standing === "good" ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="size-3" /> Good standing
                </Badge>
              ) : (
                <Badge variant="warning">Below requirements</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(profile.join_date, { month: "long", year: "numeric" })}
            </p>
            {profile.role === "admin" ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Shield className="size-4" /> Open admin console
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm initialName={profile.full_name ?? ""} initialGrade={profile.grade} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
