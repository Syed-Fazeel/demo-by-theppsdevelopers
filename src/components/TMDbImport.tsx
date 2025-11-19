import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTMDb, TMDbSearchResult } from "@/hooks/useTMDb";

export const TMDbImport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const { searchMovies, importMovieToDatabase } = useTMDb();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const results = await searchMovies(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleImport = async (tmdbId: number) => {
    setImporting(tmdbId);
    const success = await importMovieToDatabase(tmdbId);
    if (success) {
      setSearchResults(results => results.filter(r => r.tmdb_id !== tmdbId));
    }
    setImporting(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Search TMDb</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((movie) => (
            <Card key={movie.tmdb_id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {movie.poster_url && (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-20 h-30 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{movie.title}</h3>
                    {movie.year && (
                      <p className="text-sm text-muted-foreground">{movie.year}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {movie.overview}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleImport(movie.tmdb_id)}
                      disabled={importing === movie.tmdb_id}
                      className="mt-2"
                    >
                      {importing === movie.tmdb_id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
