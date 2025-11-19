import { Film } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockMovies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    emotionScore: 8.7,
  },
  {
    id: 2,
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    emotionScore: 9.2,
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    emotionScore: 8.9,
  },
  {
    id: 4,
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crime",
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    emotionScore: 8.5,
  },
  {
    id: 5,
    title: "Forrest Gump",
    year: 1994,
    genre: "Drama",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    emotionScore: 8.8,
  },
  {
    id: 6,
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi",
    poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
    emotionScore: 9.0,
  },
];

const Catalog = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            <Film className="h-8 w-8" />
            <span>Movie Emotion Tracker</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Movie Catalog</h1>
          <p className="text-muted-foreground">Explore emotion timelines for your favorite films</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMovies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`}>
              <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 border-border bg-card">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{movie.year}</span>
                    <Badge variant="secondary">{movie.genre}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-emotion-warm rounded-full"
                        style={{ width: `${(movie.emotionScore / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-primary">{movie.emotionScore}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
