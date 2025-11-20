import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { ActivityItem } from "@/components/ActivityItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Get users being followed
      const { data: followingData } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];

      if (followingIds.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Get their graphs
      const { data: graphs } = await supabase
        .from("emotion_graphs")
        .select(`
          id,
          created_at,
          user_id,
          movie_id,
          movies (title, poster_url),
          profiles (display_name, avatar_url)
        `)
        .in("user_id", followingIds)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      // Get their reviews
      const { data: reviews } = await supabase
        .from("manual_reviews")
        .select(`
          id,
          created_at,
          user_id,
          movie_id,
          overall_rating,
          movies (title, poster_url),
          profiles (display_name, avatar_url)
        `)
        .in("user_id", followingIds)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      // Combine and sort by date
      const combined = [
        ...(graphs?.map(g => ({ ...g, type: "graph" })) || []),
        ...(reviews?.map(r => ({ ...r, type: "review" })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(combined);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Sign in to see your feed</h2>
            <p className="text-muted-foreground">
              Follow users to see their activity here
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Activity Feed</h1>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Users className="h-16 w-16 text-muted-foreground mx-auto" />
                <h2 className="text-xl font-semibold">No activity yet</h2>
                <p className="text-muted-foreground">
                  Start following users to see their activity here
                </p>
                <Link to="/catalog">
                  <Button>Discover Movies</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <ActivityItem key={`${activity.type}-${activity.id}-${index}`} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityFeed;