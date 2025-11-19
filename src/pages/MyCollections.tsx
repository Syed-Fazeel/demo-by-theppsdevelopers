import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const MyCollections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_items (
            id,
            movies (
              id,
              title,
              poster_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newCollection.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('collections')
        .insert({
          user_id: user.id,
          ...newCollection,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Collection created successfully",
      });

      setIsDialogOpen(false);
      setNewCollection({ name: "", description: "", is_public: false });
      fetchCollections();
    } catch (error: any) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Collection deleted successfully",
      });

      fetchCollections();
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Collections</h1>
              <p className="text-muted-foreground">Organize and share your favorite movies</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Organize your favorite movies into themed collections
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sci-Fi Favorites"
                      value={newCollection.name}
                      onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your collection..."
                      value={newCollection.description}
                      onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Make Public</Label>
                    <Switch
                      id="public"
                      checked={newCollection.is_public}
                      onCheckedChange={(checked) => setNewCollection({ ...newCollection, is_public: checked })}
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Collection</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary h-64 rounded-lg" />
                </div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <Card className="border-border bg-card/50 backdrop-blur text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">You haven't created any collections yet</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="border-border bg-card hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{collection.name}</CardTitle>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      {collection.is_public ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Private
                        </>
                      )}
                      <span>•</span>
                      <span>{collection.collection_items?.length || 0} movies</span>
                    </div>

                    {collection.collection_items && collection.collection_items.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {collection.collection_items.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="aspect-[2/3] rounded overflow-hidden">
                            <img
                              src={item.movies?.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop"}
                              alt={item.movies?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/collection/${collection.id}`}>
                        View Collection
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MyCollections;
