import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { FollowButton } from "./FollowButton";
import { Link } from "react-router-dom";

interface UserCardProps {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
  };
}

export const UserCard = ({ user }: UserCardProps) => {
  const initials = user.display_name?.slice(0, 2).toUpperCase() || "U";

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Link to={`/profile?user=${user.id}`}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback className="bg-secondary text-lg">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/profile?user=${user.id}`}>
            <h3 className="font-semibold hover:text-primary transition-colors">
              {user.display_name}
            </h3>
          </Link>
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {user.bio}
            </p>
          )}
        </div>

        <FollowButton userId={user.id} size="sm" />
      </div>
    </Card>
  );
};