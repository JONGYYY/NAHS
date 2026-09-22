import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service · NAHS Attendance",
  description:
    "The terms for using the NAHS chapter register to check into meetings and log hours.",
};

const LAST_UPDATED = "September 21, 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "Using the app",
    body: [
      "This app is a private tool for our National Art Honor Society (NAHS) chapter. By signing in, you agree to these terms.",
      "Access is for current chapter members and officers who sign in with their school Google account. New members are approved by an officer before their first check-in.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "Sign in only with your own school Google account, and keep your login private. You are responsible for activity that happens under your account.",
      "Provide accurate information, including your correct name and grade, so attendance and hours are recorded properly.",
    ],
  },
  {
    heading: "Honest attendance and hours",
    body: [
      "Check in only for meetings you actually attend, and log only service (SSL) hours you actually completed.",
      "Sharing check-in codes, checking in for someone else, or entering false hours undermines the chapter and may result in your records being corrected and your access being removed. As NAHS members, we hold ourselves to standards of character and service.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not attempt to access records that are not yours, disrupt the service, or misuse the app in any way.",
      "Officers may edit records, adjust hours, and manage membership to keep chapter data accurate.",
    ],
  },
  {
    heading: "Availability",
    body: [
      "We offer this app as-is for the convenience of the chapter. We do our best to keep it running and accurate, but we cannot guarantee it will always be available or error-free.",
      "If you notice a mistake in your records, let an officer know so it can be fixed.",
    ],
  },
  {
    heading: "Changes and ending access",
    body: [
      "We may update these terms as the chapter's needs change; the date above shows the latest version. Continuing to use the app means you accept the current terms.",
      "Officers may suspend or remove access for members who leave the chapter or violate these terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms? Reach out to a chapter officer or the NAHS faculty sponsor.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated={LAST_UPDATED}
      intro="These terms cover how members use the chapter register to check into meetings, log SSL hours, and track activities."
      sections={SECTIONS}
    />
  );
}
