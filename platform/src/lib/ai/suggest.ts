import { anthropic } from "@/lib/anthropic";
import type { Company, Feedback } from "@prisma/client";

export function buildSuggestMessages(feedback: Feedback, company: Company) {
  const systemPrompt = `Du bist ein hilfreicher Assistent für ${company.name}.${company.description ? ` ${company.description}.` : ""}

Deine Aufgabe ist es, professionelle, herzliche und persönliche Antworten auf Gästebewertungen zu verfassen.

Regeln:
- Antworte in der Sprache der Bewertung (Deutsch, Englisch, etc.)
- Maximal 120 Wörter
- Beginne NICHT mit "Lieber Gast" oder "Dear Guest"
- Gehe konkret auf den Inhalt der Bewertung ein
- Bedanke dich aufrichtig für positives Feedback
- Erkläre bei negativem Feedback sachlich und lösungsorientiert
- Lade den Gast ein, wiederzukommen
- Verwende einen warmen, professionellen Ton`;

  const userMessage = `Bitte schreibe eine Antwort auf folgende Bewertung:

${feedback.rating ? `Bewertung: ${feedback.rating}/5 Sterne` : ""}
${feedback.authorName ? `Von: ${feedback.authorName}` : ""}
${feedback.title ? `Titel: ${feedback.title}` : ""}

Bewertungstext:
${feedback.body}`;

  return { systemPrompt, userMessage };
}

export async function streamSuggestion(
  feedback: Feedback,
  company: Company,
  onChunk: (text: string) => void
): Promise<string> {
  const { systemPrompt, userMessage } = buildSuggestMessages(feedback, company);

  let fullText = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  return fullText;
}
