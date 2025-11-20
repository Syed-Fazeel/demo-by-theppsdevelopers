import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const TrendingMovies = () => {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      // Get graphs from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: graphData, error } = await supabase
        .from("emotion_graphs")
        .select("movie_id")
        .gte("created_at", sevenDaysAgo.toISOString())
        .eq("is_public", true)
        .eq("moderation_status", "approved");

      if (error) throw error;

      // Count by movie_id
      const movieCounts: Record<string, number> = {};
      graphData?.forEach((graph) => {
        movieCounts[graph.movie_id] = (movieCounts[graph.movie_id] || 0) + 1;
      });

      // Get top 6 movies
      const topMovieIds = Object.entries(movieCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([id]) => id);

      if (topMovieIds.length === 0) {
        setTrending([]);
        return;
      }

      // Fetch movie details
      const { data: movies } = await supabase
        .from("movies")
        .select("*")
        .in("id", topMovieIds);

      setTrending(movies || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">Trending This Week</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {trending.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`}>
            <Card className="overflow-hidden group cursor-pointer hover:shadow-glow transition-all">
              <div className="aspect-[2/3] relative">
                <img
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};