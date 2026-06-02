import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ResponseEditor } from "@/components/feedback/ResponseEditor";
import { ActionForm } from "@/components/actions/ActionForm";
import { StarRating } from "@/components/feedback/StarRating";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, sourceLabel, statusLabel } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ feedbackId: string }>;
}

export default async function FeedbackDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { feedbackId } = await params;

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/settings");

  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId, companyId: company.id },
    include: { actions: { orderBy: { createdAt: "desc" } } },
  });

  if (!feedback) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/inbox" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold">Bewertung</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">
                  {sourceLabel(feedback.source)}
                </span>
                <StarRating rating={feedback.rating} />
              </div>
              <CardTitle className="text-base">
                {feedback.title ?? "Bewertung ohne Titel"}
              </CardTitle>
            </div>
            <Badge variant="outline">{statusLabel(feedback.responseStatus)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            von {feedback.authorName ?? "Anonym"} · {formatDate(feedback.publishedAt)}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{feedback.body}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Antwort verfassen</CardTitle>
            <ActionForm feedbackId={feedback.id} />
          </div>
        </CardHeader>
        <CardContent>
          <ResponseEditor
            feedbackId={feedback.id}
            initialDraft={feedback.responseDraft}
            aiSuggestion={feedback.aiSuggestion}
            responseStatus={feedback.responseStatus}
          />
        </CardContent>
      </Card>

      {feedback.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verknüpfte Maßnahmen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {feedback.actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between text-sm">
                <span>{action.title}</span>
                <span className="text-muted-foreground text-xs">{action.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
