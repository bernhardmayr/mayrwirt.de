"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function CsvImportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported?: number; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/feedback", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);
    setResult(data);
    if (data.imported != null) router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-3.5 h-3.5" />
          CSV importieren
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bewertungen importieren</DialogTitle>
          <DialogDescription>
            Laden Sie eine CSV-Datei mit Ihren Bewertungen hoch. Erwartete Spalten:{" "}
            <code className="text-xs bg-muted px-1 rounded">date, author, rating, title, body, source</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:text-xs file:font-medium file:bg-muted cursor-pointer"
          />
          {result?.imported != null && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              {result.imported} Bewertungen importiert.
            </div>
          )}
          {result?.error && (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Importieren…" : "Importieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
