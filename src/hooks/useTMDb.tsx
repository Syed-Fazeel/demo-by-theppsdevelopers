import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TMDbSearchResult {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  overview: string;
}

export interface TMDbMovieData {
  tmdb_id: number;
  title: string;
  synopsis: string;
  year: number | null;
  runtime: number;
  poster_url: string | null;
  backdrop_url: string | null;
  genres: string[];
  cast_members: string[];
  director: string | null;
  trailer_url: string | null;
  rating: number;
}

export const useTMDb = () => {
  const { toast } = useToast();

  const searchMovies = async (query: string): Promise<TMDbSearchResult[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-tmdb-movie', {
        body: { action: 'search', query }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to search movies');
      }

      return data.results;
    } catch (error) {
      console.error('Error searching TMDb:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search movies",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchMovieDetails = async (tmdbId: number): Promise<TMDbMovieData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-tmdb-movie', {
        body: { action: 'fetch', tmdbId }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch movie details');
      }

      return data.movie;
    } catch (error) {
      console.error('Error fetching TMDb movie:', error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch movie details",
        variant: "destructive",
      });
      return null;
    }
  };

  const importMovieToDatabase = async (tmdbId: number): Promise<string | null> => {
    try {
      const movieData = await fetchMovieDetails(tmdbId);
      
      if (!movieData) {
        throw new Error('Failed to fetch movie data');
      }

      const { data, error } = await supabase
        .from('movies')
        .insert({
          tmdb_id: movieData.tmdb_id,
          title: movieData.title,
          synopsis: movieData.synopsis,
          year: movieData.year,
          runtime: movieData.runtime,
          poster_url: movieData.poster_url,
          backdrop_url: movieData.backdrop_url,
          genres: movieData.genres,
          cast_members: movieData.cast_members,
          director: movieData.director,
          trailer_url: movieData.trailer_url,
          rating: movieData.rating,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${movieData.title} has been added to the database`,
      });

      return data.id;
    } catch (error) {
      console.error('Error importing movie:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import movie",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    searchMovies,
    fetchMovieDetails,
    importMovieToDatabase,
  };
};