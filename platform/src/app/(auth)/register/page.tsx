"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareShare } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        companyName: formData.get("companyName"),
        companyDescription: formData.get("companyDescription"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registrierung fehlgeschlagen.");
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <MessageSquareShare className="w-6 h-6" />
            </div>
          </div>
          <CardTitle>Konto erstellen</CardTitle>
          <CardDescription>Registrieren Sie sich für ReviewHub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Ihr Name</Label>
              <Input id="name" name="name" required placeholder="Max Mustermann" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" name="email" type="email" required placeholder="max@firma.de" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" name="password" type="password" required placeholder="Mindestens 8 Zeichen" minLength={8} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyName">Firmenname</Label>
              <Input id="companyName" name="companyName" required placeholder="Hotel Alpensonne GmbH" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyDescription">
                Firmenbeschreibung{" "}
                <span className="text-muted-foreground font-normal">(für KI-Antworten)</span>
              </Label>
              <Textarea
                id="companyDescription"
                name="companyDescription"
                placeholder="Familiengeführtes Hotel in den Alpen seit 1980, bekannt für herzliche Gastfreundschaft und regionale Küche."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrierung…" : "Konto erstellen"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Bereits registriert?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
