import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
import { TMDbReview } from "@/hooks/useTMDb";
import { formatDistanceToNow } from "date-fns";

interface TMDbReviewsSectionProps {
  reviews: TMDbReview[];
  totalCount: number;
}

export const TMDbReviewsSection = ({ reviews, totalCount }: TMDbReviewsSectionProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No TMDb reviews available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">TMDb Community Reviews ({totalCount})</h3>
        <Badge variant="outline" className="gap-1">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          TMDb
        </Badge>
      </div>
      
      {reviews.map((review, index) => (
        <Card key={index} className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.avatar_url || undefined} />
                <AvatarFallback>{review.author[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{review.author}</span>
                  {review.rating && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {review.rating}/10
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-foreground/90 whitespace-pre-line line-clamp-6 mb-2">
                  {review.content}
                </p>
                
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  Read full review on TMDb
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
