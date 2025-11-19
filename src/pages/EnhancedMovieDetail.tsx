import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, PenSquare, Heart, MessageCircle, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Header from "@/components/Header";
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
  const [loading, setLoading] = useState(true);
  const [activeGraphs, setActiveGraphs] = useState({
    consensus: true,
    personal: true,
    nlp: false,
  });

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

      setMovie(movieData);
      setGraphs(graphsData || []);
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

  // Create sample graph data
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
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border bg-card shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Emotion Timeline</CardTitle>
            <p className="text-muted-foreground">
              Track the emotional journey throughout the movie
            </p>
            
            <div className="flex gap-4 flex-wrap mt-4">
              <Button
                variant={activeGraphs.consensus ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGraphs({...activeGraphs, consensus: !activeGraphs.consensus})}
              >
                Consensus
              </Button>
              <Button
                variant={activeGraphs.personal ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGraphs({...activeGraphs, personal: !activeGraphs.personal})}
                disabled={!user}
              >
                Personal
              </Button>
              <Button
                variant={activeGraphs.nlp ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGraphs({...activeGraphs, nlp: !activeGraphs.nlp})}
              >
                NLP Analysis
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGraphData}>
                  <defs>
                    <linearGradient id="consensusGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--emotion-positive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--emotion-positive))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="personalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="nlpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--emotion-neutral))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--emotion-neutral))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Time (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 10]}
                    label={{ value: 'Emotion Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {activeGraphs.consensus && (
                    <Area
                      type="monotone"
                      dataKey="consensus"
                      stroke="hsl(var(--emotion-positive))"
                      strokeWidth={3}
                      fill="url(#consensusGradient)"
                      name="Consensus"
                    />
                  )}
                  {activeGraphs.personal && user && (
                    <Area
                      type="monotone"
                      dataKey="personal"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      fill="url(#personalGradient)"
                      name="Personal"
                    />
                  )}
                  {activeGraphs.nlp && (
                    <Area
                      type="monotone"
                      dataKey="nlp"
                      stroke="hsl(var(--emotion-neutral))"
                      strokeWidth={3}
                      fill="url(#nlpGradient)"
                      name="NLP Analysis"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Based on {graphs.length} user reactions
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              No reviews yet. Be the first to add one!
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              No comments yet. Start the conversation!
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EnhancedMovieDetail;
