import { Link, useLocation } from "react-router-dom";
import { Home, Film, User, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/catalog"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/catalog") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Film className="h-5 w-5" />
          <span className="text-xs mt-1">Catalog</span>
        </Link>

        {user && (
          <Link
            to="/feed"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive("/feed") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">Feed</span>
          </Link>
        )}

        <Link
          to={user ? "/profile" : "/auth"}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/profile") || isActive("/auth") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};