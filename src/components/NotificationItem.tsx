import { Link } from "react-router-dom";
import { Heart, MessageSquare, UserPlus, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link_url?: string;
    is_read: boolean;
    created_at: string;
  };
  onClick?: () => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-5 w-5 text-primary" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-accent" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-primary" />;
      case "system":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      default:
        return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const content = (
    <div
      className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
        !notification.is_read ? "bg-accent/20" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.link_url) {
    return <Link to={notification.link_url}>{content}</Link>;
  }

  return content;
};