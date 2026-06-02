import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RespondSchema = z.object({ text: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const feedback = await prisma.feedback.findFirst({
    where: { id, companyId: company.id },
    include: { connection: true },
  });
  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const body = await req.json();
  const parsed = RespondSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Text fehlt oder zu lang." }, { status: 400 });

  // Attempt platform-specific publishing
  let platformPublished = false;
  if (feedback.source === "google" && feedback.connection) {
    try {
      const { publishGoogleReply } = await import("@/lib/platforms/google");
      await publishGoogleReply(feedback, feedback.connection, parsed.data.text);
      platformPublished = true;
    } catch (err) {
      console.error("Google reply failed:", err);
    }
  }

  await prisma.feedback.update({
    where: { id },
    data: {
      responseText: parsed.data.text,
      responseStatus: "published",
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    platformPublished,
    note: !platformPublished && feedback.source !== "csv"
      ? "Antwort lokal gespeichert. Bitte manuell auf der Plattform veröffentlichen."
      : undefined,
  });
}
