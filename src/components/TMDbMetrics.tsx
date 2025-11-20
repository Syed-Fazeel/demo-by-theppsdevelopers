import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Users } from "lucide-react";

interface TMDbMetricsProps {
  rating: number;
  voteCount: number;
  popularity: number;
}

export const TMDbMetrics = ({ rating, voteCount, popularity }: TMDbMetricsProps) => {
  const isPopular = popularity > 20;
  const isTrending = popularity > 50;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TMDb Rating</p>
              <p className="text-2xl font-bold">{rating.toFixed(1)}/10</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vote Count</p>
              <p className="text-2xl font-bold">{voteCount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Popularity</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{popularity.toFixed(0)}</p>
                {isTrending && (
                  <Badge variant="default" className="bg-green-500">Trending</Badge>
                )}
                {isPopular && !isTrending && (
                  <Badge variant="secondary">Popular</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
