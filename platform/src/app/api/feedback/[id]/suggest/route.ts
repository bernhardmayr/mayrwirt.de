import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamSuggestion } from "@/lib/ai/suggest";

function buildMockSuggestion(authorName: string | null, rating: number | null): string {
  if (rating !== null && rating >= 4) {
    return `Vielen herzlichen Dank für Ihre wunderbare Bewertung${authorName ? `, ${authorName}` : ""}! Es freut uns sehr zu hören, dass Ihr Aufenthalt bei uns so angenehm war. Ihr positives Feedback motiviert unser Team täglich aufs Neue. Wir würden uns freuen, Sie bald wieder bei uns begrüßen zu dürfen!`;
  }
  if (rating !== null && rating <= 2) {
    return `Vielen Dank für Ihr ehrliches Feedback${authorName ? `, ${authorName}` : ""}. Es tut uns leid zu hören, dass Ihr Aufenthalt nicht unseren Ansprüchen gerecht wurde. Wir nehmen Ihre Kritik sehr ernst und werden die genannten Punkte gezielt verbessern. Gerne würden wir Ihnen die Möglichkeit geben, sich von unserem verbesserten Service zu überzeugen.`;
  }
  return `Herzlichen Dank für Ihre Bewertung${authorName ? `, ${authorName}` : ""}! Wir freuen uns über Ihr Feedback und nehmen sowohl die positiven Aspekte als auch die Verbesserungsvorschläge gerne an. Unser Ziel ist es, bei Ihrem nächsten Besuch noch besser für Sie da zu sein.`;
}

async function* mockStream(text: string) {
  const words = text.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 40));
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) return NextResponse.json({ error: "Kein Unternehmen." }, { status: 404 });

  const feedback = await prisma.feedback.findFirst({ where: { id, companyId: company.id } });
  if (!feedback) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const useMock = !process.env.ANTHROPIC_API_KEY || process.env.NODE_ENV === "test";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = "";

        if (useMock) {
          const mockText = buildMockSuggestion(feedback.authorName, feedback.rating);
          for await (const chunk of mockStream(mockText)) {
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          await streamSuggestion(feedback, company, (chunk) => {
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          });
        }

        prisma.feedback
          .update({ where: { id }, data: { aiSuggestion: fullText, aiGeneratedAt: new Date() } })
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
