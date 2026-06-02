import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewHub – Feedback Management Plattform",
  description:
    "Verwalten Sie Kundenbewertungen von Google, TripAdvisor, Booking.com und mehr – mit KI-unterstützten Antwortvorschlägen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
