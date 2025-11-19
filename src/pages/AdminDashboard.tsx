import { useState, useEffect } from "react";
import { Users, Film, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TMDbImport } from "@/components/TMDbImport";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalReviews: 0,
    pendingReviews: 0,
  });
  const [pendingContent, setPendingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [usersResult, moviesResult, reviewsResult, pendingResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('movies').select('id', { count: 'exact', head: true }),
        supabase.from('manual_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('manual_reviews')
          .select('*, movies(title), profiles(display_name)')
          .eq('moderation_status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalMovies: moviesResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        pendingReviews: pendingResult.data?.length || 0,
      });

      setPendingContent(pendingResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('manual_reviews')
        .update({ moderation_status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Approved",
        description: "Review has been approved",
      });

      fetchDashboardData();
    } catch (error: any) {
      console.error('Error approving review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve review",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('manual_reviews')
        .update({ moderation_status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Review has been rejected",
      });

      fetchDashboardData();
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject review",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                <Film className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMovies}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.pendingReviews}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="moderation" className="space-y-4">
            <TabsList>
              <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="movies">Movie Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="import">Import Movies</TabsTrigger>
            </TabsList>

            <TabsContent value="moderation" className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-20 bg-secondary rounded" />
                      ))}
                    </div>
                  ) : pendingContent.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending reviews</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingContent.map((review) => (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{review.movies?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {review.profiles?.display_name || "Unknown User"}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              Rating: {review.overall_rating?.toFixed(1) || "N/A"}
                            </Badge>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {review.review_text}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(review.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User management tools coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movies">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Movie Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Movie management tools coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import">
              <TMDbImport />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
