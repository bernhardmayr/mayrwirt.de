"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Save } from "lucide-react";

interface ResponseEditorProps {
  feedbackId: string;
  initialDraft: string | null;
  aiSuggestion: string | null;
  responseStatus: string;
}

export function ResponseEditor({
  feedbackId,
  initialDraft,
  aiSuggestion,
  responseStatus,
}: ResponseEditorProps) {
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [suggestion, setSuggestion] = useState(aiSuggestion ?? "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState(responseStatus);
  const [message, setMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function generateSuggestion() {
    if (loadingAI) {
      abortRef.current?.abort();
      setLoadingAI(false);
      return;
    }
    setLoadingAI(true);
    setSuggestion("");
    setMessage("");
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/suggest`, {
        method: "POST",
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Fehler beim Generieren.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setSuggestion(full);
      }

      setDraft(full);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessage("KI-Vorschlag fehlgeschlagen. Bitte prüfen Sie den API-Schlüssel.");
      }
    } finally {
      setLoadingAI(false);
    }
  }

  async function saveDraft() {
    setSaving(true);
    const res = await fetch(`/api/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseDraft: draft, responseStatus: "draft" }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus("draft");
      setMessage("Entwurf gespeichert.");
    } else {
      setMessage("Fehler beim Speichern.");
    }
  }

  async function publish() {
    setPublishing(true);
    const res = await fetch(`/api/feedback/${feedbackId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft }),
    });
    setPublishing(false);
    if (res.ok) {
      setStatus("published");
      setMessage("Antwort veröffentlicht.");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error ?? "Fehler beim Veröffentlichen.");
    }
  }

  const isPublished = status === "published";

  return (
    <div className="space-y-3">
      {suggestion && suggestion !== draft && (
        <div className="rounded-lg border bg-blue-50 p-3 space-y-2">
          <p className="text-xs font-medium text-blue-700">KI-Vorschlag</p>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{suggestion}</p>
          <Button size="sm" variant="outline" onClick={() => setDraft(suggestion)}>
            Vorschlag übernehmen
          </Button>
        </div>
      )}

      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        placeholder="Antwort schreiben…"
        disabled={isPublished}
        className="resize-none"
      />

      {message && (
        <p className={`text-sm ${message.includes("Fehler") ? "text-destructive" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={generateSuggestion}
          disabled={isPublished}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loadingAI ? "Stoppen" : "KI-Vorschlag"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={saveDraft}
          disabled={saving || isPublished || !draft}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Speichern…" : "Entwurf speichern"}
        </Button>
        <Button
          size="sm"
          onClick={publish}
          disabled={publishing || isPublished || !draft}
        >
          <Send className="w-3.5 h-3.5" />
          {publishing ? "Veröffentlichen…" : "Antwort veröffentlichen"}
        </Button>
      </div>
    </div>
  );
}
