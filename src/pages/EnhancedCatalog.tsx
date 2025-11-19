import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, BookmarkPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AddToCollectionDialog } from "@/components/AddToCollectionDialog";

interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  poster_url: string;
  rating: number;
}

const EnhancedCatalog = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<{ id: string; title: string } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;

      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary h-96 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Movie Catalog</h1>
          <p className="text-muted-foreground mb-6">Explore emotion timelines for your favorite films</p>
          
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search movies by title or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No movies found</p>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Card key={movie.id} className="group overflow-hidden hover:shadow-glow transition-all duration-300 border-border bg-card h-full">
                <Link to={`/movie/${movie.id}`}>
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop"}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/movie/${movie.id}`}>
                    <h3 className="font-bold text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">{movie.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{movie.year}</span>
                    {movie.genres && movie.genres.length > 0 && (
                      <Badge variant="secondary">{movie.genres[0]}</Badge>
                    )}
                  </div>
                  {movie.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-emotion-warm rounded-full"
                          style={{ width: `${(movie.rating / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-primary">{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {user && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedMovie({ id: movie.id, title: movie.title });
                      }}
                    >
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Add to Collection
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedMovie && (
        <AddToCollectionDialog
          open={!!selectedMovie}
          onOpenChange={(open) => !open && setSelectedMovie(null)}
          movieId={selectedMovie.id}
          movieTitle={selectedMovie.title}
        />
      )}
    </div>
  );
};

export default EnhancedCatalog;
