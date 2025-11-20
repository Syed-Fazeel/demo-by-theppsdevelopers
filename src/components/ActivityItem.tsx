import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, FileText, Star } from "lucide-react";

interface ActivityItemProps {
  activity: {
    id: string;
    type: "graph" | "review";
    created_at: string;
    user_id: string;
    movie_id: string;
    overall_rating?: number;
    profiles?: {
      display_name: string;
      avatar_url?: string;
    };
    movies?: {
      title: string;
      poster_url?: string;
    };
  };
}

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  const displayName = activity.profiles?.display_name || "Someone";
  const initials = displayName.slice(0, 2).toUpperCase();

  const getActivityText = () => {
    if (activity.type === "graph") {
      return (
        <>
          <span className="font-semibold">{displayName}</span> created an emotion graph for{" "}
          <span className="font-semibold">{activity.movies?.title}</span>
        </>
      );
    } else {
      return (
        <>
          <span className="font-semibold">{displayName}</span> reviewed{" "}
          <span className="font-semibold">{activity.movies?.title}</span>
          {activity.overall_rating && (
            <span className="ml-2 text-primary">
              ★ {activity.overall_rating.toFixed(1)}
            </span>
          )}
        </>
      );
    }
  };

  const getIcon = () => {
    return activity.type === "graph" ? (
      <TrendingUp className="h-5 w-5 text-primary" />
    ) : (
      <FileText className="h-5 w-5 text-accent" />
    );
  };

  return (
    <Link to={`/movie/${activity.movie_id}`}>
      <Card className="p-4 hover:shadow-glow transition-all cursor-pointer">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={activity.profiles?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-secondary">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              {getIcon()}
              <p className="text-sm">{getActivityText()}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>

          {activity.movies?.poster_url && (
            <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0">
              <img
                src={activity.movies.poster_url}
                alt={activity.movies.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};