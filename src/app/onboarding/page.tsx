import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "@/lib/actions/profile";
import { GRADES, gradeLabel } from "@/lib/constants";
import { Wordmark } from "@/components/brand/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, grade, status")
    .eq("id", user.id)
    .maybeSingle();

  // Already onboarded, move them along.
  if (profile?.full_name && profile?.grade) {
    redirect(profile.status === "active" ? "/dashboard" : "/pending");
  }

  const { error } = await searchParams;
  const suggestedName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-12">
        <Wordmark subtitle="Chapter register" className="mb-8" />
        <Card className="w-full">
          <CardHeader>
            <p className="eyebrow">New member</p>
            <CardTitle className="mt-1 text-2xl">Set up your profile</CardTitle>
            <CardDescription>
              Signed in as {user.email}. Add your name and grade so an officer can verify your
              membership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="mb-4 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error === "missing"
                  ? "Add both your name and grade to continue."
                  : "Your profile did not save. Try again."}
              </p>
            ) : null}
            <form action={completeOnboarding} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={suggestedName}
                  placeholder="Jordan Rivera"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <label
                      key={g}
                      className="relative flex cursor-pointer flex-col items-center rounded-[4px] border border-input bg-card px-2 py-3 text-center text-sm transition-colors has-[:checked]:border-foreground has-[:checked]:bg-accent"
                    >
                      <input
                        type="radio"
                        name="grade"
                        value={g}
                        className="sr-only"
                        required
                      />
                      <span className="font-display text-lg font-bold">{g}</span>
                      <span className="text-xs text-muted-foreground">
                        {gradeLabel(g).split("·")[1]?.trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
