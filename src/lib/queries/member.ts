import { createClient } from "@/lib/supabase/server";
import { computeAttendanceStats, computeStanding } from "@/lib/stats";
import type {
  Activity,
  ActivityParticipant,
  Announcement,
  Meeting,
  Settings,
  SslAdjustment,
} from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return (
    (data as Settings | null) ?? {
      id: 1,
      club_name: "National Art Honor Society",
      meeting_day: "Thursday",
      required_attendance_pct: 70,
      required_ssl_hours: 10,
      code_length: 6,
      code_window_minutes: 60,
    }
  );
}

export interface MemberOverview {
  settings: Settings;
  meetings: Meeting[];
  eligibleMeetings: Meeting[];
  attendedMeetingIds: Set<string>;
  attendanceRows: { meeting_id: string; checked_in_at: string }[];
  sslHours: number;
  attendanceStats: ReturnType<typeof computeAttendanceStats>;
  standing: "good" | "at_risk";
  nextMeeting: Meeting | null;
  latestAnnouncement: Announcement | null;
}

export async function getMemberOverview(
  memberId: string,
  joinDate: string,
): Promise<MemberOverview> {
  const supabase = await createClient();
  const today = todayISO();

  const [meetingsRes, attendanceRes, apRes, adjRes, annRes, settings] = await Promise.all([
    supabase.from("meetings").select("*").order("meeting_date", { ascending: false }),
    supabase.from("attendance").select("meeting_id, checked_in_at").eq("member_id", memberId),
    supabase
      .from("activity_participants")
      .select("ssl_hours_awarded")
      .eq("member_id", memberId),
    supabase.from("ssl_adjustments").select("hours").eq("member_id", memberId),
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1),
    getSettings(),
  ]);

  const meetings = (meetingsRes.data as Meeting[]) ?? [];
  const attendanceRows =
    (attendanceRes.data as { meeting_id: string; checked_in_at: string }[]) ?? [];
  const attendedMeetingIds = new Set(attendanceRows.map((a) => a.meeting_id));

  const eligibleMeetings = meetings.filter(
    (m) => m.meeting_date >= joinDate && m.meeting_date <= today,
  );

  const apHours = ((apRes.data as { ssl_hours_awarded: number }[]) ?? []).reduce(
    (sum, r) => sum + Number(r.ssl_hours_awarded),
    0,
  );
  const adjHours = ((adjRes.data as { hours: number }[]) ?? []).reduce(
    (sum, r) => sum + Number(r.hours),
    0,
  );
  const sslHours = Math.round((apHours + adjHours) * 100) / 100;

  const attendanceStats = computeAttendanceStats(eligibleMeetings, attendedMeetingIds);
  const standing = computeStanding(
    attendanceStats.rate,
    sslHours,
    settings.required_attendance_pct,
    settings.required_ssl_hours,
  );

  const upcoming = meetings
    .filter((m) => m.meeting_date >= today)
    .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date));
  const nextMeeting = upcoming[0] ?? null;

  return {
    settings,
    meetings,
    eligibleMeetings,
    attendedMeetingIds,
    attendanceRows,
    sslHours,
    attendanceStats,
    standing,
    nextMeeting,
    latestAnnouncement: ((annRes.data as Announcement[]) ?? [])[0] ?? null,
  };
}

export interface MemberActivityRow extends ActivityParticipant {
  activity: Activity | null;
}

export async function getMemberActivities(memberId: string) {
  const supabase = await createClient();
  const [apRes, adjRes] = await Promise.all([
    supabase
      .from("activity_participants")
      .select("*, activity:activities(*)")
      .eq("member_id", memberId),
    supabase
      .from("ssl_adjustments")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false }),
  ]);

  const participants = (apRes.data as MemberActivityRow[]) ?? [];
  participants.sort((a, b) =>
    (b.activity?.activity_date ?? "").localeCompare(a.activity?.activity_date ?? ""),
  );

  return {
    participants,
    adjustments: (adjRes.data as SslAdjustment[]) ?? [],
  };
}
