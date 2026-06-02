import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { RatingTrendChart } from "@/components/dashboard/RatingTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, CheckCircle, Clock } from "lucide-react";

async function getDashboardData(userId: string) {
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return null;

  const [total, pending, published, feedbacks] = await Promise.all([
    prisma.feedback.count({ where: { companyId: company.id } }),
    prisma.feedback.count({ where: { companyId: company.id, responseStatus: "pending" } }),
    prisma.feedback.count({ where: { companyId: company.id, responseStatus: "published" } }),
    prisma.feedback.findMany({
      where: { companyId: company.id, rating: { not: null } },
      select: { rating: true, publishedAt: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  const ratings = feedbacks.filter((f) => f.rating !== null).map((f) => f.rating as number);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const responseRate = total > 0 ? Math.round((published / total) * 100) : 0;

  // Group by month for trend chart
  const byMonth = new Map<string, number[]>();
  for (const f of feedbacks) {
    if (!f.rating) continue;
    const key = f.publishedAt.toISOString().slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(f.rating);
  }
  const ratingTrend = Array.from(byMonth.entries()).map(([date, rs]) => ({
    date,
    avg: rs.reduce((a, b) => a + b, 0) / rs.length,
  }));

  return { total, pending, avgRating, responseRate, ratingTrend, companyName: company.name };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Firmenprofil nicht gefunden.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">{data.companyName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Bewertungen gesamt"
          value={data.total}
          icon={MessageSquare}
        />
        <StatCard
          title="Ø Bewertung"
          value={data.avgRating > 0 ? `${data.avgRating.toFixed(1)} ⭐` : "–"}
          icon={Star}
        />
        <StatCard
          title="Antwortrate"
          value={`${data.responseRate}%`}
          description="Beantwortete Bewertungen"
          icon={CheckCircle}
        />
        <StatCard
          title="Ausstehend"
          value={data.pending}
          description="Noch nicht beantwortet"
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bewertungstrend</CardTitle>
        </CardHeader>
        <CardContent>
          <RatingTrendChart data={data.ratingTrend} />
        </CardContent>
      </Card>
    </div>
  );
}
