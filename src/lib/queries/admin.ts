import { createClient } from "@/lib/supabase/server";
import { computeAttendanceStats, computeStanding } from "@/lib/stats";
import type {
  Activity,
  ActivityParticipant,
  Attendance,
  AttendanceCode,
  Meeting,
  Profile,
  Settings,
  SslAdjustment,
} from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export interface MemberStat {
  profile: Profile;
  rate: number;
  attended: number;
  eligible: number;
  currentStreak: number;
  longestStreak: number;
  sslHours: number;
  standing: "good" | "at_risk";
}

export interface AdminData {
  settings: Settings;
  profiles: Profile[];
  meetings: Meeting[];
  attendance: Attendance[];
  participants: ActivityParticipant[];
  adjustments: SslAdjustment[];
  activities: Activity[];
}

export async function getAdminData(): Promise<AdminData> {
  const supabase = await createClient();
  const [
    settingsRes,
    profilesRes,
    meetingsRes,
    attendanceRes,
    participantsRes,
    adjustmentsRes,
    activitiesRes,
  ] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("meetings").select("*").order("meeting_date", { ascending: false }),
    supabase.from("attendance").select("*"),
    supabase.from("activity_participants").select("*"),
    supabase.from("ssl_adjustments").select("*"),
    supabase.from("activities").select("*").order("activity_date", { ascending: false }),
  ]);

  return {
    settings: (settingsRes.data as Settings) ?? {
      id: 1,
      club_name: "National Art Honor Society",
      meeting_day: "Thursday",
      required_attendance_pct: 70,
      required_ssl_hours: 10,
      code_length: 6,
      code_window_minutes: 60,
    },
    profiles: (profilesRes.data as Profile[]) ?? [],
    meetings: (meetingsRes.data as Meeting[]) ?? [],
    attendance: (attendanceRes.data as Attendance[]) ?? [],
    participants: (participantsRes.data as ActivityParticipant[]) ?? [],
    adjustments: (adjustmentsRes.data as SslAdjustment[]) ?? [],
    activities: (activitiesRes.data as Activity[]) ?? [],
  };
}

export function computeMemberStats(data: AdminData): Map<string, MemberStat> {
  const today = todayISO();
  const map = new Map<string, MemberStat>();

  // Group attendance by member
  const attByMember = new Map<string, Set<string>>();
  for (const a of data.attendance) {
    if (!attByMember.has(a.member_id)) attByMember.set(a.member_id, new Set());
    attByMember.get(a.member_id)!.add(a.meeting_id);
  }

  // Group SSL hours by member
  const hoursByMember = new Map<string, number>();
  for (const p of data.participants) {
    hoursByMember.set(
      p.member_id,
      (hoursByMember.get(p.member_id) ?? 0) + Number(p.ssl_hours_awarded),
    );
  }
  for (const adj of data.adjustments) {
    hoursByMember.set(adj.member_id, (hoursByMember.get(adj.member_id) ?? 0) + Number(adj.hours));
  }

  for (const profile of data.profiles) {
    const attended = attByMember.get(profile.id) ?? new Set<string>();
    const eligible = data.meetings.filter(
      (m) => m.meeting_date >= profile.join_date && m.meeting_date <= today,
    );
    const stats = computeAttendanceStats(eligible, attended);
    const sslHours = Math.round((hoursByMember.get(profile.id) ?? 0) * 100) / 100;
    const standing = computeStanding(
      stats.rate,
      sslHours,
      data.settings.required_attendance_pct,
      data.settings.required_ssl_hours,
    );
    map.set(profile.id, {
      profile,
      rate: stats.rate,
      attended: stats.attended,
      eligible: stats.eligible,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      sslHours,
      standing,
    });
  }

  return map;
}

export interface MeetingWithCount extends Meeting {
  attendee_count: number;
  code: AttendanceCode | null;
}

export async function getMeetingsWithCounts(): Promise<MeetingWithCount[]> {
  const supabase = await createClient();
  const [meetingsRes, attRes, codesRes] = await Promise.all([
    supabase.from("meetings").select("*").order("meeting_date", { ascending: false }),
    supabase.from("attendance").select("meeting_id"),
    supabase.from("attendance_codes").select("*"),
  ]);

  const counts = new Map<string, number>();
  for (const a of (attRes.data as { meeting_id: string }[]) ?? []) {
    counts.set(a.meeting_id, (counts.get(a.meeting_id) ?? 0) + 1);
  }
  const codes = new Map<string, AttendanceCode>();
  for (const c of (codesRes.data as AttendanceCode[]) ?? []) codes.set(c.meeting_id, c);

  return ((meetingsRes.data as Meeting[]) ?? []).map((m) => ({
    ...m,
    attendee_count: counts.get(m.id) ?? 0,
    code: codes.get(m.id) ?? null,
  }));
}

export interface MeetingDetail {
  meeting: Meeting;
  code: AttendanceCode | null;
  attendees: (Attendance & { profile: Profile })[];
  presentIds: Set<string>;
  members: Profile[];
}

export async function getMeetingDetail(id: string): Promise<MeetingDetail | null> {
  const supabase = await createClient();
  const { data: meeting } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
  if (!meeting) return null;

  const [codeRes, attRes, membersRes] = await Promise.all([
    supabase.from("attendance_codes").select("*").eq("meeting_id", id).maybeSingle(),
    supabase
      .from("attendance")
      .select("*, profile:profiles(*)")
      .eq("meeting_id", id)
      .order("checked_in_at"),
    supabase.from("profiles").select("*").eq("status", "active").order("full_name"),
  ]);

  const attendees = (attRes.data as (Attendance & { profile: Profile })[]) ?? [];
  return {
    meeting: meeting as Meeting,
    code: (codeRes.data as AttendanceCode | null) ?? null,
    attendees,
    presentIds: new Set(attendees.map((a) => a.member_id)),
    members: (membersRes.data as Profile[]) ?? [],
  };
}

export interface ActivityWithCount extends Activity {
  participant_count: number;
  total_hours: number;
}

export async function getActivitiesWithCounts(): Promise<ActivityWithCount[]> {
  const supabase = await createClient();
  const [actRes, partRes] = await Promise.all([
    supabase.from("activities").select("*").order("activity_date", { ascending: false }),
    supabase.from("activity_participants").select("activity_id, ssl_hours_awarded"),
  ]);

  const counts = new Map<string, { n: number; hrs: number }>();
  for (const p of (partRes.data as { activity_id: string; ssl_hours_awarded: number }[]) ?? []) {
    const cur = counts.get(p.activity_id) ?? { n: 0, hrs: 0 };
    cur.n += 1;
    cur.hrs += Number(p.ssl_hours_awarded);
    counts.set(p.activity_id, cur);
  }

  return ((actRes.data as Activity[]) ?? []).map((a) => ({
    ...a,
    participant_count: counts.get(a.id)?.n ?? 0,
    total_hours: Math.round((counts.get(a.id)?.hrs ?? 0) * 100) / 100,
  }));
}

export interface ActivityDetail {
  activity: Activity;
  participants: (ActivityParticipant & { profile: Profile })[];
  participantIds: Set<string>;
  members: Profile[];
}

export async function getActivityDetail(id: string): Promise<ActivityDetail | null> {
  const supabase = await createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!activity) return null;

  const [partRes, membersRes] = await Promise.all([
    supabase
      .from("activity_participants")
      .select("*, profile:profiles(*)")
      .eq("activity_id", id),
    supabase.from("profiles").select("*").eq("status", "active").order("full_name"),
  ]);

  const participants =
    (partRes.data as (ActivityParticipant & { profile: Profile })[]) ?? [];
  return {
    activity: activity as Activity,
    participants,
    participantIds: new Set(participants.map((p) => p.member_id)),
    members: (membersRes.data as Profile[]) ?? [],
  };
}
