export type FeedbackSource = "google" | "tripadvisor" | "booking" | "csv";
export type ResponseStatus = "pending" | "draft" | "published" | "skipped";
export type ActionStatus = "open" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface FeedbackWithActions {
  id: string;
  source: string;
  authorName: string | null;
  rating: number | null;
  title: string | null;
  body: string;
  publishedAt: Date;
  responseStatus: string;
  responseDraft: string | null;
  responseText: string | null;
  aiSuggestion: string | null;
  actions: { id: string; title: string; status: string }[];
}

export interface DashboardStats {
  total: number;
  pending: number;
  avgRating: number;
  responseRate: number;
  ratingTrend: { date: string; avg: number }[];
}
