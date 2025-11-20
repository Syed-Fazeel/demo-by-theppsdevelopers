import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

interface TMDbCredits {
  cast: Array<{ name: string; order: number }>;
  crew: Array<{ name: string; job: string }>;
}

interface TMDbVideos {
  results: Array<{ type: string; site: string; key: string }>;
}

interface TMDbReview {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

interface TMDbReviews {
  results: TMDbReview[];
  total_results: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    const { action, tmdbId, query } = await req.json();

    // Search for movies by title
    if (action === 'search' && query) {
      const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`TMDb API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          results: searchData.results.map((movie: any) => ({
            tmdb_id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
            overview: movie.overview,
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch detailed movie information by TMDb ID
    if (action === 'fetch' && tmdbId) {
      // Fetch movie details
      const movieUrl = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
      const movieResponse = await fetch(movieUrl);
      
      if (!movieResponse.ok) {
        throw new Error(`TMDb API error: ${movieResponse.status}`);
      }

      const movie: TMDbMovie = await movieResponse.json();

      // Fetch credits (cast and crew)
      const creditsUrl = `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`;
      const creditsResponse = await fetch(creditsUrl);
      const credits: TMDbCredits = await creditsResponse.json();

      // Fetch videos (trailers)
      const videosUrl = `${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}`;
      const videosResponse = await fetch(videosUrl);
      const videos: TMDbVideos = await videosResponse.json();

      // Fetch reviews
      const reviewsUrl = `${TMDB_BASE_URL}/movie/${tmdbId}/reviews?api_key=${TMDB_API_KEY}`;
      const reviewsResponse = await fetch(reviewsUrl);
      const reviews: TMDbReviews = await reviewsResponse.json();

      // Extract relevant data
      const director = credits.crew.find(person => person.job === 'Director')?.name || null;
      const cast = credits.cast
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map(person => person.name);
      
      const trailer = videos.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

      const movieData = {
        tmdb_id: movie.id,
        title: movie.title,
        synopsis: movie.overview,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        runtime: movie.runtime,
        poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
        backdrop_url: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
        genres: movie.genres.map(g => g.name),
        cast_members: cast,
        director: director,
        trailer_url: trailerUrl,
        rating: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        tmdb_reviews: reviews.results.map(r => ({
          author: r.author_details.name || r.author_details.username || r.author,
          avatar_url: r.author_details.avatar_path ? `${TMDB_IMAGE_BASE_URL}/w200${r.author_details.avatar_path}` : null,
          rating: r.author_details.rating,
          content: r.content,
          created_at: r.created_at,
          url: r.url,
        })),
        tmdb_review_count: reviews.total_results,
      };

      return new Response(
        JSON.stringify({ success: true, movie: movieData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action or missing parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-tmdb-movie function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});