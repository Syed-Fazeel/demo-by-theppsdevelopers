import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";

interface CommentsSectionProps {
  graphId?: string;
  reviewId?: string;
}

export const CommentsSection = ({ graphId, reviewId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments-${graphId || reviewId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: graphId ? `graph_id=eq.${graphId}` : `review_id=eq.${reviewId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [graphId, reviewId]);

  const fetchComments = async () => {
    try {
      let query = supabase
        .from("comments")
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (graphId) query = query.eq("graph_id", graphId);
      if (reviewId) query = query.eq("review_id", reviewId);

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      <CommentForm
        graphId={graphId}
        reviewId={reviewId}
        onCommentAdded={fetchComments}
      />

      <Separator />

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};