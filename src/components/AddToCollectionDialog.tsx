import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  name: string;
}

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string;
  movieTitle: string;
}

export const AddToCollectionDialog = ({ open, onOpenChange, movieId, movieTitle }: AddToCollectionDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchCollections();
    }
  }, [open, user]);

  const fetchCollections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collections")
      .select("id, name")
      .eq("user_id", user!.id)
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  const handleAddToCollection = async (collectionId: string) => {
    setAdding(collectionId);

    // Check if movie already in collection
    const { data: existing } = await supabase
      .from("collection_items")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("movie_id", movieId)
      .single();

    if (existing) {
      toast({
        title: "Already Added",
        description: "This movie is already in that collection",
      });
      setAdding(null);
      return;
    }

    const { error } = await supabase
      .from("collection_items")
      .insert({
        collection_id: collectionId,
        movie_id: movieId,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add movie to collection",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Added "${movieTitle}" to collection`,
      });
      onOpenChange(false);
    }
    setAdding(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No collections yet. Create one in My Collections.
            </p>
          ) : (
            collections.map((collection) => (
              <Button
                key={collection.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddToCollection(collection.id)}
                disabled={adding === collection.id}
              >
                {adding === collection.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {collection.name}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
