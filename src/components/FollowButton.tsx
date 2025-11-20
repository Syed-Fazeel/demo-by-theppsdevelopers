import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export const FollowButton = ({ userId, size = "default", variant = "default" }: FollowButtonProps) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userId !== user.id) {
      checkIfFollowing();
    }
  }, [user, userId]);

  const checkIfFollowing = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();

    setFollowing(!!data);
  };

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    setLoading(true);

    try {
      if (following) {
        // Unfollow
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;
        setFollowing(false);
        toast.success("Unfollowed");
      } else {
        // Follow
        const { error } = await supabase
          .from("followers")
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        setFollowing(true);
        toast.success("Following");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if viewing own profile
  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Button
      variant={following ? "secondary" : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={loading}
      className="gap-2"
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
};