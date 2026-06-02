"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { RefreshCw, Unplug } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectionCardProps {
  provider: string;
  displayName: string;
  status: string;
  lastSyncedAt: Date | null;
  feedbackCount: number;
  connectionId?: string;
  infoUrl?: string;
}

const providerColors: Record<string, string> = {
  google: "border-blue-200 bg-blue-50",
  tripadvisor: "border-green-200 bg-green-50",
  booking: "border-indigo-200 bg-indigo-50",
  csv: "border-gray-200 bg-gray-50",
};

const providerIcons: Record<string, string> = {
  google: "G",
  tripadvisor: "TA",
  booking: "B",
  csv: "CSV",
};

export function ConnectionCard({
  provider,
  displayName,
  status,
  lastSyncedAt,
  feedbackCount,
  connectionId,
  infoUrl,
}: ConnectionCardProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    const res = await fetch(`/api/connections/${provider}/sync`, { method: "POST" });
    setSyncing(false);
    if (res.ok) router.refresh();
  }

  async function handleConnect() {
    window.location.href = `/api/connections/${provider}/connect`;
  }

  const isConnected = status === "active";

  return (
    <Card className={providerColors[provider] ?? ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-sm border">
              {providerIcons[provider] ?? "?"}
            </div>
            <div>
              <CardTitle className="text-sm">{displayName}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{feedbackCount} Bewertungen</p>
            </div>
          </div>
          <Badge variant={isConnected ? "success" : "outline"}>
            {isConnected ? "Verbunden" : "Nicht verbunden"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {lastSyncedAt && (
          <p className="text-xs text-muted-foreground">
            Letzter Sync: {formatDate(lastSyncedAt)}
          </p>
        )}
        {infoUrl && !isConnected && (
          <p className="text-xs text-muted-foreground">
            Manuelle Verbindung erforderlich.{" "}
            <a href={infoUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Zur Plattform
            </a>
          </p>
        )}
        <div className="flex gap-2">
          {isConnected ? (
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sync…" : "Sync starten"}
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>
              Verbinden
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
