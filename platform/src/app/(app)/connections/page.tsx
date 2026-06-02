import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ConnectionCard } from "@/components/connections/ConnectionCard";
import { CsvImportButton } from "@/components/connections/CsvImportButton";
import { BOOKING_EXTRANET_URL } from "@/lib/platforms/booking";

const PLATFORMS = [
  {
    provider: "google",
    displayName: "Google Business Profile",
    description: "Lesen und beantworten Sie Google-Bewertungen direkt.",
  },
  {
    provider: "tripadvisor",
    displayName: "TripAdvisor",
    description: "Bewertungen lesen. Antworten über Deep-Link.",
  },
  {
    provider: "booking",
    displayName: "Booking.com",
    description: "CSV-Export aus dem Extranet importieren.",
    infoUrl: BOOKING_EXTRANET_URL,
  },
];

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/settings");

  const [connections, feedbackCounts] = await Promise.all([
    prisma.platformConnection.findMany({ where: { companyId: company.id } }),
    prisma.feedback.groupBy({
      by: ["source"],
      where: { companyId: company.id },
      _count: true,
    }),
  ]);

  const countMap = Object.fromEntries(feedbackCounts.map((c) => [c.source, c._count]));
  const connectionMap = Object.fromEntries(connections.map((c) => [c.provider, c]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plattformen</h1>
          <p className="text-muted-foreground text-sm">Verbinden Sie Bewertungsplattformen oder importieren Sie per CSV.</p>
        </div>
        <CsvImportButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(({ provider, displayName, infoUrl }) => {
          const conn = connectionMap[provider];
          return (
            <ConnectionCard
              key={provider}
              provider={provider}
              displayName={displayName}
              status={conn?.status ?? "inactive"}
              lastSyncedAt={conn?.lastSyncedAt ?? null}
              feedbackCount={countMap[provider] ?? 0}
              connectionId={conn?.id}
              infoUrl={infoUrl}
            />
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-medium">CSV-Format</p>
        <p>Spalten: <code className="bg-muted px-1 rounded text-xs">date, author, rating, title, body, source</code></p>
        <p>Datum-Format: YYYY-MM-DD · Bewertung: 1–5 · Quelle: google, tripadvisor, booking oder csv</p>
      </div>
    </div>
  );
}
