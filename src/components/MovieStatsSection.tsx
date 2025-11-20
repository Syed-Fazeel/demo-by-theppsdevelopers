import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, FileText, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MovieStatsProps {
  movieId: string;
}

export const MovieStatsSection = ({ movieId }: MovieStatsProps) => {
  const [stats, setStats] = useState({
    nlpCount: 0,
    liveReactionCount: 0,
    manualReviewCount: 0,
    consensusExists: false,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [movieId]);

  const fetchStats = async () => {
    try {
      // Fetch emotion graphs grouped by source_type
      const { data: graphs } = await supabase
        .from("emotion_graphs")
        .select("source_type")
        .eq("movie_id", movieId)
        .eq("moderation_status", "approved")
        .eq("is_public", true);

      // Fetch manual reviews for average rating
      const { data: reviews } = await supabase
        .from("manual_reviews")
        .select("overall_rating")
        .eq("movie_id", movieId)
        .eq("moderation_status", "approved")
        .eq("is_public", true);

      const nlpCount = graphs?.filter((g) => g.source_type === "nlp_analysis").length || 0;
      const liveReactionCount = graphs?.filter((g) => g.source_type === "live_reaction").length || 0;
      const manualReviewCount = graphs?.filter((g) => g.source_type === "manual_review").length || 0;
      const consensusExists = graphs?.some((g) => g.source_type === "consensus") || false;

      const ratings = reviews?.filter((r) => r.overall_rating).map((r) => r.overall_rating) || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      setStats({
        nlpCount,
        liveReactionCount,
        manualReviewCount,
        consensusExists,
        averageRating,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-pulse">
        <div className="h-32 bg-secondary rounded-lg" />
        <div className="h-32 bg-secondary rounded-lg" />
        <div className="h-32 bg-secondary rounded-lg" />
        <div className="h-32 bg-secondary rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">NLP Analysis</p>
              <p className="text-3xl font-bold">{stats.nlpCount}</p>
            </div>
            <div className="h-12 w-12 bg-chart-1/20 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-chart-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Live Reactions</p>
              <p className="text-3xl font-bold">{stats.liveReactionCount}</p>
            </div>
            <div className="h-12 w-12 bg-chart-2/20 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Manual Reviews</p>
              <p className="text-3xl font-bold">{stats.manualReviewCount}</p>
            </div>
            <div className="h-12 w-12 bg-chart-3/20 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
              <p className="text-3xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
