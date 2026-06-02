import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGoogleReviews } from "@/lib/platforms/google";
import { fetchTripAdvisorReviews } from "@/lib/platforms/tripadvisor";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { provider } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const connection = await prisma.platformConnection.findFirst({
    where: { companyId: company.id, provider },
  });
  if (!connection) return NextResponse.json({ error: "Verbindung nicht gefunden." }, { status: 404 });

  let reviews: { externalId: string; authorName: string; rating: number; title?: string; body: string; publishedAt: Date }[] = [];

  try {
    if (provider === "google") {
      reviews = await fetchGoogleReviews(connection);
    } else if (provider === "tripadvisor" && connection.externalId) {
      reviews = await fetchTripAdvisorReviews(connection.externalId);
    } else {
      return NextResponse.json({ error: "Sync für diesen Anbieter nicht unterstützt." }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Deduplicate: find existing externalIds to skip
  const externalIds = reviews.map((r) => r.externalId);
  const existing = await prisma.feedback.findMany({
    where: { source: provider, externalId: { in: externalIds } },
    select: { externalId: true },
  });
  const existingIds = new Set(existing.map((e) => e.externalId));
  const newReviews = reviews.filter((r) => !existingIds.has(r.externalId));

  let importedCount = 0;
  if (newReviews.length > 0) {
    const result = await prisma.feedback.createMany({
      data: newReviews.map((r) => ({
        companyId: company.id,
        connectionId: connection.id,
        source: provider,
        externalId: r.externalId,
        authorName: r.authorName,
        rating: r.rating,
        title: r.title ?? null,
        body: r.body,
        publishedAt: r.publishedAt,
      })),
    });
    importedCount = result.count;
  }

  await prisma.platformConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date() },
  });

  return NextResponse.json({ synced: importedCount });
}
