import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LiveReaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [movie, setMovie] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScore, setCurrentScore] = useState([5]);
  const [progress, setProgress] = useState(0);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      fetchMovie();
      createSession();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, user]);

  const fetchMovie = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast({
        title: "Error",
        description: "Failed to load movie",
        variant: "destructive",
      });
    }
  };

  const createSession = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('live_reaction_sessions')
        .insert({
          movie_id: id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 0.5; // Increment by 0.5% every interval
          if (newProgress >= 100) {
            handleFinish();
            return 100;
          }
          return newProgress;
        });
      }, 100); // Update every 100ms for smooth animation
    }
  };

  const handleScoreChange = (value: number[]) => {
    setCurrentScore(value);
    // Record this data point
    const dataPoint = {
      t_offset: progress,
      score: value[0],
      timestamp: Date.now(),
    };
    setSessionData((prev) => [...prev, dataPoint]);
  };

  const handleFinish = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);

    if (!user || !id || !sessionId) return;

    try {
      // Create emotion graph from session data
      const { data: graphData, error: graphError } = await supabase
        .from('emotion_graphs')
        .insert({
          movie_id: id,
          user_id: user.id,
          source_type: 'live_reaction',
          graph_data: sessionData,
          is_public: true,
          moderation_status: 'approved',
        })
        .select()
        .single();

      if (graphError) throw graphError;

      // Update session as completed and link to graph
      await supabase
        .from('live_reaction_sessions')
        .update({
          session_data: sessionData,
          completed_at: new Date().toISOString(),
          is_completed: true,
          graph_id: graphData.id,
        })
        .eq('id', sessionId);

      toast({
        title: "Session Complete!",
        description: "Your live reaction has been saved",
      });

      navigate(`/movie/${id}`);
    } catch (error) {
      console.error('Error finishing session:', error);
      toast({
        title: "Error",
        description: "Failed to save your reaction",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentScore([5]);
    setSessionData([]);
    createSession();
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl">Live Reaction: {movie.title}</CardTitle>
            <p className="text-muted-foreground">
              Track your emotional response in real-time as you watch
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Movie Progress</span>
                <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{currentScore[0].toFixed(1)}</div>
                <p className="text-muted-foreground">Current Emotion Score</p>
              </div>

              <Slider
                value={currentScore}
                onValueChange={handleScoreChange}
                min={0}
                max={10}
                step={0.1}
                className="py-4"
                disabled={!isPlaying}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Negative</span>
                <span>Neutral</span>
                <span>Very Positive</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    {progress > 0 ? "Resume" : "Start"}
                  </>
                )}
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="gap-2"
                disabled={isPlaying}
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>

              {progress >= 100 && (
                <Button
                  onClick={handleFinish}
                  size="lg"
                  variant="default"
                >
                  Finish & Save
                </Button>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click "Start" to begin tracking your reaction</li>
                <li>• Adjust the slider as you watch to reflect your emotional response</li>
                <li>• The timeline will automatically progress</li>
                <li>• Your reaction will be saved to your profile</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LiveReaction;
