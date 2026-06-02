interface TAReview {
  id: string;
  user: { username: string };
  rating: number;
  title: string;
  text: string;
  published_date: string;
  url: string;
}

export async function fetchTripAdvisorReviews(locationId: string): Promise<{
  externalId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  publishedAt: Date;
}[]> {
  const apiKey = process.env.TRIPADVISOR_API_KEY;
  if (!apiKey) throw new Error("Kein TripAdvisor API-Schlüssel.");

  const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/reviews?key=${apiKey}&language=all`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!res.ok) throw new Error(`TripAdvisor API Fehler: ${res.status}`);

  const data: { data?: TAReview[] } = await res.json();
  return (data.data ?? []).map((r) => ({
    externalId: String(r.id),
    authorName: r.user.username,
    rating: r.rating,
    title: r.title,
    body: r.text,
    publishedAt: new Date(r.published_date),
  }));
}

export function getTripAdvisorReplyUrl(locationId: string): string {
  return `https://www.tripadvisor.com/BusinessSupport-a_article.ReviewResponse_Page-${locationId}`;
}
