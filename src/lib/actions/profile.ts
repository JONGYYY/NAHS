"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

export async function completeOnboarding(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const grade = Number(formData.get("grade"));

  if (!fullName || !grade) {
    redirect("/onboarding?error=missing");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, grade })
    .eq("id", user.id);

  if (error) {
    redirect("/onboarding?error=save");
  }

  redirect("/pending");
}

export async function updateOwnProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const grade = Number(formData.get("grade"));

  if (!fullName || !grade) return { ok: false, error: "Name and grade are required" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, grade })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}
