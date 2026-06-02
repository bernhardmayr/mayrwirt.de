import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wochen`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Monaten`;
  return `vor ${Math.floor(days / 365)} Jahren`;
}

export function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    google: "Google",
    tripadvisor: "TripAdvisor",
    booking: "Booking.com",
    csv: "CSV-Import",
  };
  return labels[source] ?? source;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Ausstehend",
    draft: "Entwurf",
    published: "Beantwortet",
    skipped: "Übersprungen",
  };
  return labels[status] ?? status;
}

export function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };
  return labels[priority] ?? priority;
}

export function actionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: "Offen",
    in_progress: "In Arbeit",
    done: "Erledigt",
  };
  return labels[status] ?? status;
}
