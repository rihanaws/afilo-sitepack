import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afilo PitchKit Growth Report",
  description:
    "Submit your URL, and within 48 hours Afilo PitchKit turns your growth page into a positioning diagnosis, ranked fixes, and an SEO/content brief — a software-assisted digital report from TechSci Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY;
  const body = publishableKey ? <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider> : children;

  return (
    <html lang="en">
      <body>{body}</body>
    </html>
  );
}
