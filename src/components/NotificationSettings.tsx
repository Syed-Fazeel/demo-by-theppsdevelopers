import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          like_notifications: data.like_notifications,
          comment_notifications: data.comment_notifications,
          follow_notifications: data.follow_notifications
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;

    setPreferences(prev => ({ ...prev, [key]: value }));

    try {
      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert({
          user_id: user.id,
          [key]: value
        });

      if (error) throw error;

      toast.success("Preference updated");
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !value }));
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications}
            onCheckedChange={(checked) => updatePreference("email_notifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="like-notifications">Like Notifications</Label>
            <p className="text-sm text-muted-foreground">
              When someone likes your content
            </p>
          </div>
          <Switch
            id="like-notifications"
            checked={preferences.like_notifications}
            onCheckedChange={(checked) => updatePreference("like_notifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="comment-notifications">Comment Notifications</Label>
            <p className="text-sm text-muted-foreground">
              When someone comments on your content
            </p>
          </div>
          <Switch
            id="comment-notifications"
            checked={preferences.comment_notifications}
            onCheckedChange={(checked) => updatePreference("comment_notifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="follow-notifications">Follow Notifications</Label>
            <p className="text-sm text-muted-foreground">
              When someone follows you
            </p>
          </div>
          <Switch
            id="follow-notifications"
            checked={preferences.follow_notifications}
            onCheckedChange={(checked) => updatePreference("follow_notifications", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};