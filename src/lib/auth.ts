import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Returns the authenticated user's profile, or null if not signed in.
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}

/**
 * Enforce that a member is signed in, onboarded, and approved.
 * Redirects to the appropriate step otherwise.
 */
export async function requireMember(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = data as Profile | null;

  if (!profile || !profile.full_name || !profile.grade) redirect("/onboarding");
  if (profile.status === "pending") redirect("/pending");
  if (profile.status === "inactive") redirect("/pending");

  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireMember();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
