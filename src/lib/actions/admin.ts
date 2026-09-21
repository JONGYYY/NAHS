"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, isAdmin: data?.role === "admin" && data?.status === "active" };
}

const CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeCode(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARSET[randomInt(CODE_CHARSET.length)];
  }
  return out;
}

/* ------------------------------------------------------------------ Meetings */

export async function createMeeting(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };

  const title = String(formData.get("title") ?? "").trim();
  const meeting_date = String(formData.get("meeting_date") ?? "");
  if (!title || !meeting_date) return { ok: false, error: "Title and date are required" };

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      title,
      meeting_date,
      start_time: (formData.get("start_time") as string) || null,
      end_time: (formData.get("end_time") as string) || null,
      location: (formData.get("location") as string) || null,
      description: (formData.get("description") as string) || null,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/meetings");
  revalidatePath("/admin");
  return { ok: true, data: { id: data.id } };
}

export async function updateMeeting(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };

  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("meetings")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      meeting_date: String(formData.get("meeting_date") ?? ""),
      start_time: (formData.get("start_time") as string) || null,
      end_time: (formData.get("end_time") as string) || null,
      location: (formData.get("location") as string) || null,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/meetings/${id}`);
  revalidatePath("/admin/meetings");
  return { ok: true };
}

export async function deleteMeeting(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/meetings");
  return { ok: true };
}

/* -------------------------------------------------------------- Attendance codes */

export async function generateCode(meetingId: string): Promise<ActionResult<{ code: string }>> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };

  const { data: settings } = await supabase
    .from("settings")
    .select("code_length, code_window_minutes")
    .eq("id", 1)
    .maybeSingle();

  const length = settings?.code_length ?? 6;
  const windowMin = settings?.code_window_minutes ?? 60;
  const code = makeCode(length);
  const expires = new Date(Date.now() + windowMin * 60 * 1000).toISOString();

  const { error } = await supabase.from("attendance_codes").upsert(
    {
      meeting_id: meetingId,
      code,
      is_active: true,
      expires_at: expires,
    },
    { onConflict: "meeting_id" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/meetings/${meetingId}`);
  return { ok: true, data: { code } };
}

export async function setCodeActive(
  meetingId: string,
  active: boolean,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase
    .from("attendance_codes")
    .update({ is_active: active })
    .eq("meeting_id", meetingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/meetings/${meetingId}`);
  return { ok: true };
}

/* -------------------------------------------------------------- Attendance rows */

export async function addAttendance(
  meetingId: string,
  memberId: string,
): Promise<ActionResult> {
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("attendance").upsert(
    { meeting_id: meetingId, member_id: memberId, method: "manual", recorded_by: user!.id },
    { onConflict: "meeting_id,member_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/meetings/${meetingId}`);
  return { ok: true };
}

export async function removeAttendance(
  meetingId: string,
  memberId: string,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("member_id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/meetings/${meetingId}`);
  return { ok: true };
}

/* -------------------------------------------------------------------- Members */

export async function setMemberStatus(
  memberId: string,
  status: "pending" | "active" | "inactive",
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("profiles").update({ status }).eq("id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/members");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setMemberRole(
  memberId: string,
  role: "member" | "admin",
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("profiles").update({ role }).eq("id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function updateMember(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const id = String(formData.get("id"));
  const full_name = String(formData.get("full_name") ?? "").trim();
  const grade = Number(formData.get("grade"));
  const { error } = await supabase
    .from("profiles")
    .update({ full_name, grade })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/members");
  return { ok: true };
}

/* ----------------------------------------------------------------- Activities */

export async function createActivity(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const name = String(formData.get("name") ?? "").trim();
  const activity_date = String(formData.get("activity_date") ?? "");
  if (!name || !activity_date) return { ok: false, error: "Name and date are required" };

  const { data, error } = await supabase
    .from("activities")
    .insert({
      name,
      activity_date,
      category: (formData.get("category") as string) || null,
      description: (formData.get("description") as string) || null,
      ssl_hours_default: Number(formData.get("ssl_hours_default") ?? 0),
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/activities");
  return { ok: true, data: { id: data.id } };
}

export async function updateActivity(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("activities")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      activity_date: String(formData.get("activity_date") ?? ""),
      category: (formData.get("category") as string) || null,
      description: (formData.get("description") as string) || null,
      ssl_hours_default: Number(formData.get("ssl_hours_default") ?? 0),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/activities/${id}`);
  revalidatePath("/admin/activities");
  return { ok: true };
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/activities");
  return { ok: true };
}

export async function setParticipant(
  activityId: string,
  memberId: string,
  hours: number,
  notes?: string,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("activity_participants").upsert(
    {
      activity_id: activityId,
      member_id: memberId,
      ssl_hours_awarded: hours,
      notes: notes || null,
    },
    { onConflict: "activity_id,member_id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/activities/${activityId}`);
  return { ok: true };
}

export async function removeParticipant(
  activityId: string,
  memberId: string,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase
    .from("activity_participants")
    .delete()
    .eq("activity_id", activityId)
    .eq("member_id", memberId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/activities/${activityId}`);
  return { ok: true };
}

/* ------------------------------------------------------------ SSL adjustments */

export async function addSslAdjustment(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const member_id = String(formData.get("member_id"));
  const hours = Number(formData.get("hours"));
  if (!member_id || Number.isNaN(hours)) return { ok: false, error: "Member and hours required" };
  const { error } = await supabase.from("ssl_adjustments").insert({
    member_id,
    hours,
    reason: (formData.get("reason") as string) || null,
    awarded_by: user!.id,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/members");
  return { ok: true };
}

/* -------------------------------------------------------------- Announcements */

export async function createAnnouncement(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required" };
  const { error } = await supabase.from("announcements").insert({
    title,
    body: (formData.get("body") as string) || null,
    created_by: user!.id,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/announcements");
  return { ok: true };
}

/* -------------------------------------------------------------------- Settings */

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized" };
  const { error } = await supabase
    .from("settings")
    .update({
      club_name: String(formData.get("club_name") ?? "").trim(),
      meeting_day: String(formData.get("meeting_day") ?? "").trim(),
      required_attendance_pct: Number(formData.get("required_attendance_pct") ?? 70),
      required_ssl_hours: Number(formData.get("required_ssl_hours") ?? 10),
      code_length: Number(formData.get("code_length") ?? 6),
      code_window_minutes: Number(formData.get("code_window_minutes") ?? 60),
    })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
}
