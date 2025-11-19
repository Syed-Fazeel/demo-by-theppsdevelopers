import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const sections = [
  { id: "opening", label: "Opening", description: "First 20% of the movie" },
  { id: "rising_action", label: "Rising Action", description: "Building tension (20-50%)" },
  { id: "climax", label: "Climax", description: "Peak moment (50-70%)" },
  { id: "falling_action", label: "Falling Action", description: "Resolution begins (70-90%)" },
  { id: "resolution", label: "Resolution", description: "Final 10%" },
];

const ManualReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [movie, setMovie] = useState<any>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({
    opening: 5,
    rising_action: 5,
    climax: 5,
    falling_action: 5,
    resolution: 5,
  });
  const [reviewText, setReviewText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      fetchMovie();
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id) return;

    setIsSubmitting(true);

    try {
      // Calculate overall rating
      const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;

      // Generate graph data from section ratings
      const graphData = generateGraphFromRatings(ratings);

      // Insert the manual review
      const { data: reviewData, error: reviewError } = await supabase
        .from('manual_reviews')
        .insert({
          movie_id: id,
          user_id: user.id,
          section_ratings: ratings,
          overall_rating: overallRating,
          review_text: reviewText,
          is_public: isPublic,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Create emotion graph entry
      const { error: graphError } = await supabase
        .from('emotion_graphs')
        .insert({
          movie_id: id,
          user_id: user.id,
          source_type: 'manual_review',
          graph_data: graphData,
          is_public: isPublic,
        });

      if (graphError) throw graphError;

      toast({
        title: "Success!",
        description: "Your review has been submitted",
      });

      navigate(`/movie/${id}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateGraphFromRatings = (ratings: Record<string, number>) => {
    // Convert section ratings to smooth timeline curve
    const dataPoints = [];
    const sectionRanges = {
      opening: [0, 20],
      rising_action: [20, 50],
      climax: [50, 70],
      falling_action: [70, 90],
      resolution: [90, 100],
    };

    Object.entries(sectionRanges).forEach(([section, [start, end]]) => {
      const value = ratings[section];
      const steps = Math.floor((end - start) / 5);
      for (let i = 0; i <= steps; i++) {
        dataPoints.push({
          t_offset: start + (i * 5),
          score: value,
        });
      }
    });

    return dataPoints;
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-1/4 mb-4" />
            <div className="h-64 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/movie/${id}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movie
        </Button>

        <Card className="border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-3xl">Write a Manual Review</CardTitle>
            <CardDescription>
              Rate each section of "{movie.title}" and describe your emotional journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div>
                    <Label className="text-lg font-semibold">{section.label}</Label>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[ratings[section.id]]}
                      onValueChange={([value]) => setRatings({ ...ratings, [section.id]: value })}
                      min={0}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-primary w-12 text-right">
                      {ratings[section.id]}
                    </span>
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-4">
                <Label htmlFor="review-text" className="text-lg font-semibold">
                  Your Thoughts (Optional)
                </Label>
                <Textarea
                  id="review-text"
                  placeholder="Share your detailed thoughts about the movie's emotional journey..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/movie/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManualReview;
