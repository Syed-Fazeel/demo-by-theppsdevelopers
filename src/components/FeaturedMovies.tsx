import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const FeaturedMovies = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("featured", true)
        .order("rating", { ascending: false })
        .limit(4);

      if (error) throw error;
      setFeatured(data || []);
    } catch (error) {
      console.error("Error fetching featured movies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-primary fill-primary" />
        <h2 className="text-3xl font-bold">Featured Movies</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`}>
            <Card className="overflow-hidden group cursor-pointer hover:shadow-glow transition-all">
              <div className="aspect-[2/3] relative">
                <img
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold">
                  <Star className="h-3 w-3 fill-current" />
                  {movie.rating?.toFixed(1) || "N/A"}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">{movie.year}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};