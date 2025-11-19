import { useState } from "react";
import { Search, Plus, Loader2, BookmarkPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTMDb, TMDbSearchResult } from "@/hooks/useTMDb";
import { AddToCollectionDialog } from "@/components/AddToCollectionDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

const AddMovies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<{ id: string; title: string } | null>(null);
  const [importedMovies, setImportedMovies] = useState<Map<number, string>>(new Map());
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
    const movieId = await importMovieToDatabase(tmdbId);
    if (movieId) {
      setImportedMovies(new Map(importedMovies.set(tmdbId, movieId)));
    }
    setImporting(null);
  };

  const handleAddToCollection = (tmdbId: number, title: string) => {
    const movieId = importedMovies.get(tmdbId);
    if (movieId) {
      setSelectedMovie({ id: movieId, title });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Add Movies</h1>
            <p className="text-muted-foreground">Search for movies and add them to your collections</p>
          </div>

          <Card className="border-border bg-card mb-6">
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
              {searchResults.map((movie) => {
                const isImported = importedMovies.has(movie.tmdb_id);
                return (
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
                          <div className="flex gap-2 mt-2">
                            {!isImported ? (
                              <Button
                                size="sm"
                                onClick={() => handleImport(movie.tmdb_id)}
                                disabled={importing === movie.tmdb_id}
                              >
                                {importing === movie.tmdb_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Plus className="h-3 w-3 mr-1" />
                                )}
                                Import
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAddToCollection(movie.tmdb_id, movie.title)}
                              >
                                <BookmarkPlus className="h-3 w-3 mr-1" />
                                Add to Collection
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedMovie && (
            <AddToCollectionDialog
              open={!!selectedMovie}
              onOpenChange={(open) => !open && setSelectedMovie(null)}
              movieId={selectedMovie.id}
              movieTitle={selectedMovie.title}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AddMovies;
