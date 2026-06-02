import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { formatRelative, sourceLabel, statusLabel } from "@/lib/utils";

interface FeedbackCardProps {
  id: string;
  source: string;
  authorName: string | null;
  rating: number | null;
  title: string | null;
  body: string;
  publishedAt: Date;
  responseStatus: string;
}

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  pending: "warning",
  draft: "secondary",
  published: "success",
  skipped: "outline",
};

const sourceColors: Record<string, string> = {
  google: "bg-blue-50 text-blue-700",
  tripadvisor: "bg-green-50 text-green-700",
  booking: "bg-indigo-50 text-indigo-700",
  csv: "bg-gray-50 text-gray-700",
};

export function FeedbackCard({
  id,
  source,
  authorName,
  rating,
  title,
  body,
  publishedAt,
  responseStatus,
}: FeedbackCardProps) {
  return (
    <Link href={`/inbox/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${sourceColors[source] ?? "bg-gray-50 text-gray-700"}`}
              >
                {sourceLabel(source)}
              </span>
              <StarRating rating={rating} />
            </div>
            <Badge variant={statusVariant[responseStatus] ?? "outline"}>
              {statusLabel(responseStatus)}
            </Badge>
          </div>
          {title && <p className="font-medium text-sm line-clamp-1">{title}</p>}
          <p className="text-sm text-muted-foreground line-clamp-2">{body}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{authorName ?? "Anonym"}</span>
            <span>{formatRelative(publishedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
