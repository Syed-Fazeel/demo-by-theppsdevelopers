import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LikeButtonProps {
  graphId?: string;
  reviewId?: string;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export const LikeButton = ({ graphId, reviewId, onLikeChange }: LikeButtonProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
    fetchLikeCount();
  }, [graphId, reviewId, user]);

  const checkIfLiked = async () => {
    if (!user) return;

    const query = supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id);

    if (graphId) query.eq("graph_id", graphId);
    if (reviewId) query.eq("review_id", reviewId);

    const { data } = await query.maybeSingle();
    
    if (data) {
      setLiked(true);
      setLikeId(data.id);
    }
  };

  const fetchLikeCount = async () => {
    const query = supabase
      .from("likes")
      .select("id", { count: "exact", head: true });

    if (graphId) query.eq("graph_id", graphId);
    if (reviewId) query.eq("review_id", reviewId);

    const { count } = await query;
    setLikeCount(count || 0);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    setLoading(true);
    const optimisticLiked = !liked;
    const optimisticCount = optimisticLiked ? likeCount + 1 : likeCount - 1;
    
    // Optimistic update
    setLiked(optimisticLiked);
    setLikeCount(optimisticCount);
    onLikeChange?.(optimisticLiked, optimisticCount);

    try {
      if (liked && likeId) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("id", likeId);

        if (error) throw error;
        setLikeId(null);
      } else {
        // Like
        const { data, error } = await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            graph_id: graphId || null,
            review_id: reviewId || null
          })
          .select()
          .single();

        if (error) throw error;
        setLikeId(data.id);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(!optimisticLiked);
      setLikeCount(likeCount);
      onLikeChange?.(!optimisticLiked, likeCount);
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={loading}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          liked ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
      <span className="text-sm">{likeCount}</span>
    </Button>
  );
};