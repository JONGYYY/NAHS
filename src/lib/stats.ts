import type { Meeting } from "./types";

export interface AttendanceStats {
  attended: number;
  eligible: number;
  rate: number;
  currentStreak: number;
  longestStreak: number;
  lastAttended: string | null;
}

/**
 * Compute a member's attendance stats. `eligibleMeetings` should be the meetings
 * held on/after the member joined; `attendedMeetingIds` is the set they attended.
 */
export function computeAttendanceStats(
  eligibleMeetings: Pick<Meeting, "id" | "meeting_date">[],
  attendedMeetingIds: Set<string>,
): AttendanceStats {
  const sorted = [...eligibleMeetings].sort(
    (a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime(),
  );

  let attended = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  let lastAttended: string | null = null;

  for (const m of sorted) {
    const present = attendedMeetingIds.has(m.id);
    if (present) {
      attended += 1;
      running += 1;
      longestStreak = Math.max(longestStreak, running);
      lastAttended = m.meeting_date;
    } else {
      running = 0;
    }
  }

  // current streak = trailing run of attended meetings
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (attendedMeetingIds.has(sorted[i].id)) currentStreak += 1;
    else break;
  }

  const eligible = sorted.length;
  const rate = eligible ? Math.round((attended / eligible) * 100) : 0;

  return { attended, eligible, rate, currentStreak, longestStreak, lastAttended };
}

export type Standing = "good" | "at_risk";

export function computeStanding(
  attendanceRate: number,
  sslHours: number,
  requiredPct: number,
  requiredHours: number,
): Standing {
  return attendanceRate >= requiredPct && sslHours >= requiredHours ? "good" : "at_risk";
}
