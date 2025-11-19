import { ArrowLeft, Film } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const mockGraphData = [
  { time: 0, score: 6.5 },
  { time: 10, score: 7.2 },
  { time: 20, score: 7.8 },
  { time: 30, score: 6.8 },
  { time: 40, score: 5.5 },
  { time: 50, score: 6.2 },
  { time: 60, score: 7.5 },
  { time: 70, score: 8.8 },
  { time: 80, score: 9.2 },
  { time: 90, score: 8.5 },
  { time: 100, score: 9.5 },
];

const MovieDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            <Film className="h-8 w-8" />
            <span>Movie Emotion Tracker</span>
          </Link>
        </div>
      </header>

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
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop"
              alt="Movie Poster"
              className="w-full rounded-lg shadow-card"
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">The Shawshank Redemption</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>1994</span>
                    <span>•</span>
                    <span>142 min</span>
                    <span>•</span>
                    <Badge variant="secondary">Drama</Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. A story of hope, friendship, and the resilience of the human spirit in the face of injustice.
              </p>
            </div>

            <div className="flex gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Live Reaction
              </Button>
              <Button variant="outline">
                Add Manual Review
              </Button>
            </div>
          </div>
        </div>

        <Card className="border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Emotion Timeline</CardTitle>
            <p className="text-muted-foreground">
              Track the emotional journey throughout the movie. Hover over the graph to see detailed scores.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGraphData}>
                  <defs>
                    <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--emotion-positive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--emotion-positive))" stopOpacity={0} />
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
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--emotion-positive))"
                    strokeWidth={3}
                    fill="url(#emotionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emotion-positive" />
                  <span className="text-sm text-muted-foreground">Consensus Score</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Based on 1,247 user reactions
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MovieDetail;
