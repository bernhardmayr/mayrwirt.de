"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquareShare } from "lucide-react";

const IS_DEV = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleDemoLogin() {
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: "demo@reviewhub.dev",
      password: "demo1234",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Demo-Nutzer nicht gefunden. Bitte zuerst: npm run db:seed");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <MessageSquareShare className="w-6 h-6" />
            </div>
          </div>
          <CardTitle>ReviewHub</CardTitle>
          <CardDescription>Melden Sie sich in Ihrem Konto an</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {IS_DEV && (
            <div className="rounded-lg border border-dashed border-yellow-400 bg-yellow-50 p-3 space-y-2">
              <p className="text-xs font-medium text-yellow-800">
                🛠 Entwicklungsmodus
              </p>
              <p className="text-xs text-yellow-700">
                demo@reviewhub.dev · demo1234
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Als Demo-Nutzer anmelden
              </Button>
            </div>
          )}

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" name="email" type="email" required placeholder="firma@beispiel.de" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Anmelden…" : "Anmelden"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
