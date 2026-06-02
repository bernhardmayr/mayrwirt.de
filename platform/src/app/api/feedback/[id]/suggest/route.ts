import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamSuggestion } from "@/lib/ai/suggest";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const feedback = await prisma.feedback.findFirst({ where: { id, companyId: company.id } });
  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Kein Anthropic API-Schlüssel konfiguriert." }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = "";
        await streamSuggestion(feedback, company, (chunk) => {
          fullText += chunk;
          controller.enqueue(encoder.encode(chunk));
        });

        // Save suggestion to DB (fire-and-forget)
        prisma.feedback
          .update({
            where: { id },
            data: { aiSuggestion: fullText, aiGeneratedAt: new Date() },
          })
          .catch(console.error);
      } catch (err) {
        console.error("AI suggest error:", err);
        controller.enqueue(encoder.encode("[Fehler beim Generieren des Vorschlags]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
