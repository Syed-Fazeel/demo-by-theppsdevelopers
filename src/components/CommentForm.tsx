import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface CommentFormProps {
  graphId?: string;
  reviewId?: string;
  movieId?: string;
  onCommentAdded?: () => void;
}

export const CommentForm = ({ graphId, reviewId, movieId, onCommentAdded }: CommentFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (content.length > 500) {
      toast.error("Comment too long (max 500 characters)");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          content: content.trim(),
          graph_id: graphId || null,
          review_id: reviewId || null,
          movie_id: movieId || null
        });

      if (error) throw error;

      setContent("");
      toast.success("Comment posted");
      onCommentAdded?.();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Sign in to leave a comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/500 characters
        </span>
        <Button type="submit" disabled={submitting || !content.trim()} size="sm" className="gap-2">
          <Send className="h-4 w-4" />
          Post Comment
        </Button>
      </div>
    </form>
  );
};