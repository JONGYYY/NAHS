import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAHS Attendance",
  description:
    "The chapter register: check in to meetings, log SSL hours, and see where you stand in the National Art Honor Society.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{ style: { fontFamily: "var(--font-hanken)", borderRadius: "4px" } }}
        />
      </body>
    </html>
  );
}
