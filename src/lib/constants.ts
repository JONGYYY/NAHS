export const GRADES = [9, 10, 11, 12] as const;
export type Grade = (typeof GRADES)[number];

// Grades map to cool pigments, deepening toward senior year.
export const GRADE_COLORS: Record<number, string> = {
  9: "var(--color-pigment-viridian)",
  10: "var(--color-pigment-cerulean)",
  11: "var(--color-pigment-ultramarine)",
  12: "var(--color-pigment-violet)",
};

export const GRADE_HEX: Record<number, string> = {
  9: "#3f7a5e",
  10: "#2c7c90",
  11: "#33509e",
  12: "#6b4e8e",
};

export function gradeLabel(grade: number | null | undefined) {
  if (!grade) return "Unlisted";
  const suffix: Record<number, string> = { 9: "Freshman", 10: "Sophomore", 11: "Junior", 12: "Senior" };
  return `Grade ${grade} · ${suffix[grade] ?? ""}`.trim();
}

// Artist pigment set: used only to encode categories in charts and tags.
export const PIGMENTS = [
  "#a83240", // alizarin
  "#c56a1e", // cadmium orange
  "#b98a1e", // ochre
  "#3f7a5e", // viridian
  "#2c7c90", // cerulean
  "#33509e", // ultramarine
  "#6b4e8e", // dioxazine violet
] as const;

// Kept as an alias so existing chart imports resolve to the pigment set.
export const RAINBOW = PIGMENTS;

export const ACTIVITY_CATEGORIES = [
  "Service Project",
  "Fundraiser",
  "Community Art",
  "Workshop",
  "Competition",
  "Field Trip",
  "Other",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export function categoryColor(category: string | null | undefined) {
  const idx = ACTIVITY_CATEGORIES.indexOf((category ?? "Other") as ActivityCategory);
  return RAINBOW[(idx < 0 ? ACTIVITY_CATEGORIES.length - 1 : idx) % RAINBOW.length];
}

export const ROUTES = {
  home: "/",
  onboarding: "/onboarding",
  pending: "/pending",
  dashboard: "/dashboard",
  checkIn: "/check-in",
  attendance: "/attendance",
  hours: "/hours",
  events: "/events",
  profile: "/profile",
  admin: "/admin",
  adminMeetings: "/admin/meetings",
  adminMembers: "/admin/members",
  adminActivities: "/admin/activities",
  adminAnalytics: "/admin/analytics",
  adminAnnouncements: "/admin/announcements",
  adminSettings: "/admin/settings",
} as const;
