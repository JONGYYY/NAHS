export type Role = "member" | "admin";
export type MemberStatus = "pending" | "active" | "inactive";
export type AttendanceMethod = "code" | "manual";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  grade: number | null;
  role: Role;
  status: MemberStatus;
  avatar_url: string | null;
  join_date: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AttendanceCode {
  id: string;
  meeting_id: string;
  code: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  member_id: string;
  checked_in_at: string;
  method: AttendanceMethod;
  recorded_by: string | null;
}

export interface Activity {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  activity_date: string;
  ssl_hours_default: number;
  created_by: string | null;
  created_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  member_id: string;
  ssl_hours_awarded: number;
  notes: string | null;
  created_at: string;
}

export interface SslAdjustment {
  id: string;
  member_id: string;
  hours: number;
  reason: string | null;
  awarded_by: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Settings {
  id: number;
  club_name: string;
  meeting_day: string;
  required_attendance_pct: number;
  required_ssl_hours: number;
  code_length: number;
  code_window_minutes: number;
}
