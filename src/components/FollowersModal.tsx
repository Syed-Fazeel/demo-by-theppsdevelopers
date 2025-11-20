import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { UserCard } from "./UserCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  defaultTab?: "followers" | "following";
}

export const FollowersModal = ({ open, onOpenChange, userId, defaultTab = "followers" }: FollowersModalProps) => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch followers
      const { data: followersData } = await supabase
        .from("followers")
        .select(`
          follower_id,
          profiles!followers_follower_id_fkey (
            id,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq("following_id", userId);

      // Fetch following
      const { data: followingData } = await supabase
        .from("followers")
        .select(`
          following_id,
          profiles!followers_following_id_fkey (
            id,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq("follower_id", userId);

      setFollowers(followersData?.map(f => f.profiles).filter(Boolean) || []);
      setFollowing(followingData?.map(f => f.profiles).filter(Boolean) || []);
    } catch (error) {
      console.error("Error fetching followers/following:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = (users: any[]) => {
    if (!search) return users;
    return users.filter(user =>
      user.display_name?.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value="followers" className="space-y-3 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filterUsers(followers).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? "No users found" : "No followers yet"}
              </div>
            ) : (
              filterUsers(followers).map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-3 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : filterUsers(following).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? "No users found" : "Not following anyone yet"}
              </div>
            ) : (
              filterUsers(following).map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};