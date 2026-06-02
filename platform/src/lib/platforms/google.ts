import type { Feedback, PlatformConnection } from "@prisma/client";

const DISCOVERY_URL = "https://mybusinessaccountmanagement.googleapis.com/v1";
const REVIEWS_BASE = "https://mybusiness.googleapis.com/v4";

interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  name: string;
}

const starMap: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

async function refreshTokenIfNeeded(connection: PlatformConnection): Promise<string> {
  if (!connection.accessToken) throw new Error("Kein Access Token.");

  if (connection.tokenExpiry && new Date(connection.tokenExpiry) < new Date()) {
    if (!connection.refreshToken) throw new Error("Kein Refresh Token.");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET ?? "",
        refresh_token: connection.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error("Token-Refresh fehlgeschlagen.");
    const data = await res.json();
    return data.access_token as string;
  }

  return connection.accessToken;
}

export async function fetchGoogleReviews(
  connection: PlatformConnection
): Promise<{ externalId: string; authorName: string; rating: number; body: string; publishedAt: Date }[]> {
  const token = await refreshTokenIfNeeded(connection);
  if (!connection.externalId) throw new Error("Keine Location ID.");

  const url = `${REVIEWS_BASE}/${connection.externalId}/reviews`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Reviews API Fehler: ${err}`);
  }

  const data: { reviews?: GoogleReview[] } = await res.json();
  return (data.reviews ?? []).map((r) => ({
    externalId: r.reviewId,
    authorName: r.reviewer.displayName,
    rating: starMap[r.starRating] ?? 3,
    body: r.comment ?? "",
    publishedAt: new Date(r.createTime),
  }));
}

export async function publishGoogleReply(
  feedback: Feedback,
  connection: PlatformConnection,
  text: string
): Promise<void> {
  const token = await refreshTokenIfNeeded(connection);
  if (!feedback.externalId) throw new Error("Keine externe Review-ID.");

  const url = `${REVIEWS_BASE}/${connection.externalId}/reviews/${feedback.externalId}/reply`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Reply API Fehler: ${err}`);
  }
}

export function buildGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/google/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(
  code: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET ?? "",
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/connections/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error("Code-Exchange fehlgeschlagen.");
  return res.json();
}
