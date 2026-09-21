import { redirect } from "next/navigation";
import { Hourglass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/brand/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, grade, status, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.full_name || !profile?.grade) redirect("/onboarding");
  if (profile.status === "active") redirect(profile.role === "admin" ? "/admin" : "/dashboard");

  const inactive = profile.status === "inactive";

  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
        <Wordmark subtitle="Chapter register" className="mb-10" />
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="flex size-12 items-center justify-center rounded-[4px] border border-border bg-muted">
              <Hourglass className="size-6 text-muted-foreground" />
            </div>
            <p className="eyebrow">{inactive ? "Membership inactive" : "Awaiting approval"}</p>
            <h1 className="font-display text-2xl font-semibold">
              {inactive ? "Your account is inactive" : "One step left"}
            </h1>
            <p className="text-muted-foreground">
              {inactive
                ? "An officer set your membership to inactive. Reach out to a chapter officer if you think this is a mistake."
                : "Your name is on the list. An officer approves each new member before their first check-in, and you will get access as soon as they do."}
            </p>
            <div className="mt-2 w-full rounded-[4px] border border-border bg-muted px-4 py-3 text-left text-sm">
              <div className="font-medium">{profile.full_name}</div>
              <div className="text-muted-foreground">
                {user.email} &middot; Grade {profile.grade}
              </div>
            </div>
            <form action="/auth/signout" method="post" className="w-full">
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
