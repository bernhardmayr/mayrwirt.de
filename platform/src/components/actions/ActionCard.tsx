"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, priorityLabel, actionStatusLabel, sourceLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface ActionCardProps {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  feedback?: { id: string; authorName: string | null; rating: number | null; source: string } | null;
}

const priorityVariant: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function ActionCard({ id, title, description, priority, status, dueDate, feedback }: ActionCardProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    await fetch(`/api/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setCurrentStatus(newStatus);
    setUpdating(false);
    router.refresh();
  }

  async function deleteAction() {
    if (!confirm("Maßnahme löschen?")) return;
    await fetch(`/api/actions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{title}</p>
          <Badge variant={priorityVariant[priority] ?? "secondary"}>
            {priorityLabel(priority)}
          </Badge>
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {feedback && (
          <p className="text-xs text-muted-foreground">
            Bewertung von {feedback.authorName ?? "Anonym"} · {sourceLabel(feedback.source)}
          </p>
        )}
        {dueDate && (
          <p className="text-xs text-muted-foreground">Fällig: {formatDate(dueDate)}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Select value={currentStatus} onValueChange={updateStatus} disabled={updating}>
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Arbeit</SelectItem>
              <SelectItem value="done">Erledigt</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={deleteAction}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
