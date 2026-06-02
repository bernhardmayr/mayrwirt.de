import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { CsvImportButton } from "@/components/connections/CsvImportButton";

interface Props {
  searchParams: Promise<{ status?: string; source?: string }>;
}

export default async function InboxPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/settings");

  const feedbacks = await prisma.feedback.findMany({
    where: {
      companyId: company.id,
      ...(params.status ? { responseStatus: params.status } : {}),
      ...(params.source ? { source: params.source } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const counts = await prisma.feedback.groupBy({
    by: ["responseStatus"],
    where: { companyId: company.id },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.responseStatus, c._count]));
  const total = feedbacks.length;

  const tabs = [
    { label: "Alle", status: undefined },
    { label: `Ausstehend (${countMap.pending ?? 0})`, status: "pending" },
    { label: `Entwurf (${countMap.draft ?? 0})`, status: "draft" },
    { label: `Beantwortet (${countMap.published ?? 0})`, status: "published" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <CsvImportButton />
      </div>

      {/* Tab filter links */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map(({ label, status }) => {
          const isActive = params.status === status || (!params.status && !status);
          const href = status ? `/inbox?status=${status}` : "/inbox";
          return (
            <a
              key={label}
              href={href}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Keine Bewertungen gefunden.</p>
          <p className="text-sm mt-1">Importieren Sie Bewertungen über &quot;CSV importieren&quot; oder verbinden Sie eine Plattform.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {feedbacks.map((f) => (
            <FeedbackCard
              key={f.id}
              id={f.id}
              source={f.source}
              authorName={f.authorName}
              rating={f.rating}
              title={f.title}
              body={f.body}
              publishedAt={f.publishedAt}
              responseStatus={f.responseStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
