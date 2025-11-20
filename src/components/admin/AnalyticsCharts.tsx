import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export const AnalyticsCharts = () => {
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [contentStats, setContentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // User growth (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Group by day
      const growthByDay: Record<string, number> = {};
      profiles?.forEach((profile) => {
        const date = new Date(profile.created_at).toLocaleDateString();
        growthByDay[date] = (growthByDay[date] || 0) + 1;
      });

      const growthData = Object.entries(growthByDay).map(([date, count]) => ({
        date,
        users: count
      }));

      setUserGrowth(growthData);

      // Content creation stats (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: graphs } = await supabase
        .from("emotion_graphs")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      const { data: reviews } = await supabase
        .from("manual_reviews")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      // Group by day
      const contentByDay: Record<string, { graphs: number; reviews: number }> = {};
      
      graphs?.forEach((graph) => {
        const date = new Date(graph.created_at).toLocaleDateString();
        if (!contentByDay[date]) contentByDay[date] = { graphs: 0, reviews: 0 };
        contentByDay[date].graphs += 1;
      });

      reviews?.forEach((review) => {
        const date = new Date(review.created_at).toLocaleDateString();
        if (!contentByDay[date]) contentByDay[date] = { graphs: 0, reviews: 0 };
        contentByDay[date].reviews += 1;
      });

      const contentData = Object.entries(contentByDay).map(([date, counts]) => ({
        date,
        graphs: counts.graphs,
        reviews: counts.reviews
      }));

      setContentStats(contentData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Growth (Last 30 Days)</CardTitle>
          <CardDescription>New user registrations per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Creation (Last 7 Days)</CardTitle>
          <CardDescription>Graphs and reviews created per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Bar dataKey="graphs" fill="hsl(var(--primary))" />
              <Bar dataKey="reviews" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};