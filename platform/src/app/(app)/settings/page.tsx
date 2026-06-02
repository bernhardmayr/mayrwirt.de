"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({ name: "", description: "", language: "de" });

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setCompany(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Firmenprofil</CardTitle>
          <CardDescription>
            Diese Informationen werden für KI-generierte Antwortvorschläge verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Firmenname</Label>
              <Input
                id="name"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Beschreibung für KI</Label>
              <Textarea
                id="description"
                value={company.description}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                rows={3}
                placeholder="z. B. Familiengeführtes Hotel in den Alpen, bekannt für regionale Küche…"
              />
            </div>
            <div className="space-y-1">
              <Label>Standard-Antwortsprache</Label>
              <Select
                value={company.language}
                onValueChange={(v) => setCompany({ ...company, language: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                  <SelectItem value="it">Italienisch</SelectItem>
                  <SelectItem value="fr">Französisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Speichern…" : "Speichern"}
              </Button>
              {saved && <span className="text-sm text-green-600">Gespeichert!</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
