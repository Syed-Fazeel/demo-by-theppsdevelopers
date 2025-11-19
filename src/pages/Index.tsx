import { Film, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main>
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-emotion-warm bg-clip-text text-transparent">
              Feel Every Frame
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Track, visualize, and share the emotional journey of movies through dynamic sentiment timelines. 
              Experience cinema like never before.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/catalog">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow">
                  Explore Movies
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-border bg-card/50 backdrop-blur hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Dynamic Timelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Watch emotion curves evolve in real-time as you experience the movie's narrative arc.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your reactions, compare with others, and discover how the world feels about your favorite films.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-emotion-neutral mb-4" />
                <CardTitle>Deep Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Powered by NLP analysis and manual reviews to capture every emotional nuance.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Choose Your Movie</h3>
                  <p className="text-muted-foreground">
                    Browse our extensive catalog of movies with emotion timelines generated from thousands of user reactions.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Track Your Emotions</h3>
                  <p className="text-muted-foreground">
                    Use our live reaction feature to record your emotional response as you watch, or submit a detailed manual review afterward.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emotion-neutral text-background flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Share & Discover</h3>
                  <p className="text-muted-foreground">
                    Share your emotion timeline with friends, compare experiences, and discover movies with the most dramatic emotional journeys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/30 backdrop-blur-lg mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Film className="h-6 w-6" />
              <span>Movie Emotion Tracker</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
