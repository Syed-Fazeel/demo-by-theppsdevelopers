import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
      display_name: string;
      avatar_url?: string;
    };
  };
  onDelete?: () => void;
}

export const CommentItem = ({ comment, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === comment.user_id;

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", comment.id);

      if (error) throw error;

      toast.success("Comment deleted");
      onDelete?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const displayName = comment.profiles?.display_name || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profiles?.avatar_url} alt={displayName} />
        <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground break-words">{comment.content}</p>
      </div>

      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};