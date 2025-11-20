import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, MessageSquare, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Welcome! Let's get started");
      navigate("/catalog");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      navigate("/catalog");
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        {step === 1 && (
          <Card className="p-8">
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-full">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Welcome to Emotion Graphs!</h1>
                <p className="text-lg text-muted-foreground">
                  Track and share emotional journeys through movies
                </p>
              </div>

              <div className="space-y-4 py-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Create Emotion Graphs</h3>
                    <p className="text-sm text-muted-foreground">
                      Track how you feel throughout a movie in real-time or add manual reviews
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Compare & Discover</h3>
                    <p className="text-sm text-muted-foreground">
                      See how your emotions match up with others and discover trending movies
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Join the Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Follow users, comment, and share your unique perspective
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip Tutorial
                </Button>
                <Button onClick={() => setStep(2)} className="flex-1">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8">
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-accent/10 rounded-full">
                  <Users className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Connect with Others</h2>
                <p className="text-muted-foreground">
                  Follow users to see their graphs and reviews in your feed
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <p className="text-sm">Comment on graphs to share your thoughts</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <p className="text-sm">Like content you enjoy</p>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <p className="text-sm">Build your community of movie enthusiasts</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip Tutorial
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8">
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-full">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">You're All Set!</h2>
                <p className="text-muted-foreground">
                  Ready to start exploring movies and creating emotion graphs
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 text-center">
                <p className="text-lg font-semibold mb-2">Start by exploring our catalog</p>
                <p className="text-sm text-muted-foreground">
                  Find a movie, create your first graph, and join the conversation!
                </p>
              </div>

              <Button onClick={handleComplete} className="w-full" size="lg">
                Let's Go! 🎬
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;