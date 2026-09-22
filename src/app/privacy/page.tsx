import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy · NAHS Attendance",
  description:
    "How the NAHS chapter register collects, uses, and protects member information.",
};

const LAST_UPDATED = "September 21, 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who this covers",
    body: [
      "This app is a private tool for members and officers of our National Art Honor Society (NAHS) chapter. It records meeting attendance, service (SSL) hours, and chapter activities.",
      "It is intended for current chapter members who sign in with their school Google account. It is not a public service and is not directed at children under 13.",
    ],
  },
  {
    heading: "Information we collect",
    body: [
      "When you sign in with Google, we receive your name, school email address, and profile image from your Google account. We do not receive your Google password.",
      "During onboarding you provide your grade level. As you use the app we record the meetings you check into, your SSL hours, and the activities you participate in.",
      "We also store basic account details such as your role (member or officer) and membership status (pending, active, or inactive).",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use this information only to run the chapter: to verify who you are, to record and display your attendance and hours, to show chapter-wide statistics to officers, and to manage membership.",
      "We do not sell your information, show you ads, or use it for any purpose beyond operating this chapter tool.",
    ],
  },
  {
    heading: "Who can see your information",
    body: [
      "You can see your own profile, attendance, hours, and activities.",
      "Chapter officers (admins) can see member names, school emails, grades, attendance records, SSL hours, and activity participation, because they manage the chapter.",
      "Other members cannot see your personal records.",
    ],
  },
  {
    heading: "Where your data is stored",
    body: [
      "Sign-in is handled by Google OAuth. Your account and chapter records are stored in Supabase, our database and authentication provider, and the app is hosted on Vercel. These providers process data on our behalf under their own security and privacy practices.",
      "Access to the database is restricted, and the app uses row-level security so that each person can only reach the records they are allowed to see.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep your records while you are a member so your attendance and hours stay accurate over the school year.",
      "If you leave the chapter or ask us to remove your data, an officer can set your account to inactive or delete your records. Some information may remain in backups for a limited time before it is overwritten.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can update your name and grade from your profile page. To correct attendance or hours, or to request deletion of your account, contact a chapter officer.",
      "You can stop using the app at any time by signing out and asking an officer to deactivate your account.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "If we make meaningful changes to this policy, we will update the date above and, where appropriate, let members know at a meeting or by email.",
      "Questions about your information? Reach out to a chapter officer or the NAHS faculty sponsor.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated={LAST_UPDATED}
      intro="This policy explains what information the chapter register collects, how it is used, and who can see it."
      sections={SECTIONS}
    />
  );
}
