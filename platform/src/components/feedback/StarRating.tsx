import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, max = 5 }: { rating: number | null; max?: number }) {
  if (!rating) return <span className="text-muted-foreground text-sm">–</span>;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}
