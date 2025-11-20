import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, PenSquare, Heart, MessageCircle, Share2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import EmotionTimelineGraph from "@/components/EmotionTimelineGraph";
import { CommentsSection } from "@/components/CommentsSection";
import { LikeButton } from "@/components/LikeButton";
import { ShareButton } from "@/components/ShareButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const EnhancedMovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<any>(null);
  const [graphs, setGraphs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const fetchMovieData = async () => {
    try {
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (movieError) throw movieError;

      const { data: graphsData, error: graphsError } = await supabase
        .from('emotion_graphs')
        .select('*')
        .eq('movie_id', id)
        .eq('moderation_status', 'approved')
        .eq('is_public', true);

      if (graphsError) throw graphsError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('manual_reviews')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('movie_id', id)
        .eq('moderation_status', 'approved')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      setMovie(movieData);
      setGraphs(graphsData || []);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast({
        title: "Error",
        description: "Failed to load movie details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartReaction = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start a live reaction",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/live-reaction/${id}`);
  };

  const handleAddReview = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/review/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-secondary rounded-lg" />
            <div className="h-64 bg-secondary rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
            <Link to="/catalog">
              <Button>Back to Catalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Create sample graph data (for demo - will be replaced by real data)
  const mockGraphData = [
    { time: 0, consensus: 6.5, personal: 7.0, nlp: 6.2 },
    { time: 10, consensus: 7.2, personal: 7.5, nlp: 6.8 },
    { time: 20, consensus: 7.8, personal: 8.2, nlp: 7.5 },
    { time: 30, consensus: 6.8, personal: 6.5, nlp: 7.0 },
    { time: 40, consensus: 5.5, personal: 5.0, nlp: 5.8 },
    { time: 50, consensus: 6.2, personal: 6.8, nlp: 6.5 },
    { time: 60, consensus: 7.5, personal: 8.0, nlp: 7.8 },
    { time: 70, consensus: 8.8, personal: 9.2, nlp: 8.5 },
    { time: 80, consensus: 9.2, personal: 9.5, nlp: 9.0 },
    { time: 90, consensus: 8.5, personal: 8.8, nlp: 8.7 },
    { time: 100, consensus: 9.5, personal: 9.8, nlp: 9.3 },
  ];

  // Prepare emotion layers from database
  const emotionLayers = [
    {
      id: 'consensus',
      label: 'Consensus',
      data: graphs
        .filter(g => g.source_type === 'aggregated')
        .flatMap(g => g.graph_data || []),
      color: 'hsl(var(--primary))',
      enabled: true,
    },
    {
      id: 'personal',
      label: 'My Reactions',
      data: graphs
        .filter(g => g.source_type === 'live_reaction' && g.user_id === user?.id)
        .flatMap(g => g.graph_data || []),
      color: '#22c55e',
      enabled: true,
    },
    {
      id: 'nlp',
      label: 'NLP Analysis',
      data: graphs
        .filter(g => g.source_type === 'nlp_analysis')
        .flatMap(g => g.graph_data || []),
      color: '#f59e0b',
      enabled: false,
    },
    {
      id: 'manual',
      label: 'Manual Reviews',
      data: graphs
        .filter(g => g.source_type === 'manual_review')
        .flatMap(g => g.graph_data || []),
      color: '#8b5cf6',
      enabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Link to="/catalog">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <img
              src={movie.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop"}
              alt={movie.title}
              className="w-full rounded-lg shadow-card"
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                    <span>{movie.year}</span>
                    {movie.runtime && (
                      <>
                        <span>•</span>
                        <span>{movie.runtime} min</span>
                      </>
                    )}
                    {movie.genres && movie.genres.length > 0 && (
                      <>
                        <span>•</span>
                        {movie.genres.map((genre: string, i: number) => (
                          <Badge key={i} variant="secondary">{genre}</Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {movie.synopsis && (
                <p className="text-muted-foreground leading-relaxed">{movie.synopsis}</p>
              )}

              {movie.director && (
                <div className="mt-4">
                  <span className="text-sm font-semibold">Director:</span>{" "}
                  <span className="text-sm text-muted-foreground">{movie.director}</span>
                </div>
              )}

              {movie.cast_members && movie.cast_members.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-semibold">Cast:</span>{" "}
                  <span className="text-sm text-muted-foreground">{movie.cast_members.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 flex-wrap">
              <Button onClick={handleStartReaction} className="gap-2">
                <Play className="h-4 w-4" />
                Start Live Reaction
              </Button>
              <Button variant="outline" onClick={handleAddReview} className="gap-2">
                <PenSquare className="h-4 w-4" />
                Add Manual Review
              </Button>
              <ShareButton movieId={id!} movieTitle={movie.title} />
            </div>
          </div>
        </div>

        <Card className="border-border bg-card shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Emotion Timeline</CardTitle>
            <p className="text-muted-foreground">
              Track the emotional journey throughout the movie
            </p>
          </CardHeader>
          <CardContent>
            <EmotionTimelineGraph
              title={`${movie.title} - Emotion Timeline`}
              runtime={movie.runtime}
              height={400}
              layers={emotionLayers}
              showControls={true}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">User Reviews ({reviews.length})</h3>
              <Button onClick={handleAddReview}>
                <PenSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </div>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review!</p>
                <Button onClick={handleAddReview} variant="outline">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write First Review
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.profiles?.avatar_url} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{review.profiles?.display_name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {review.overall_rating && (
                          <Badge variant="secondary" className="text-lg">
                            ⭐ {review.overall_rating}/10
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {review.review_text && (
                        <p className="text-foreground leading-relaxed">{review.review_text}</p>
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <LikeButton reviewId={review.id} />
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Reply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentsSection movieId={id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EnhancedMovieDetail;
