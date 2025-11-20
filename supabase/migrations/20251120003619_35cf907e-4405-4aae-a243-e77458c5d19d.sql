-- PHASE 1: Discovery & Search
-- Add featured column to movies for featured section
ALTER TABLE movies ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emotion_graphs_created_at ON emotion_graphs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_graphs_movie_id ON emotion_graphs(movie_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_graph_id ON likes(graph_id);
CREATE INDEX IF NOT EXISTS idx_likes_review_id ON likes(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_graph_id ON comments(graph_id);
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);

-- PHASE 3: Notifications
-- Add notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  like_notifications BOOLEAN DEFAULT true,
  comment_notifications BOOLEAN DEFAULT true,
  follow_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences" ON user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Database triggers for automatic notifications
-- Trigger when someone likes your graph
CREATE OR REPLACE FUNCTION notify_graph_liked()
RETURNS TRIGGER AS $$
DECLARE
  graph_owner_id UUID;
  liker_name TEXT;
  movie_id_val UUID;
BEGIN
  -- Get the graph owner and movie id
  SELECT user_id, movie_id INTO graph_owner_id, movie_id_val
  FROM emotion_graphs WHERE id = NEW.graph_id;
  
  -- Only notify if someone else liked their graph
  IF NEW.user_id != graph_owner_id THEN
    -- Get liker's display name
    SELECT display_name INTO liker_name FROM profiles WHERE id = NEW.user_id;
    
    -- Check if user wants like notifications
    IF EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = graph_owner_id AND like_notifications = true
    ) OR NOT EXISTS (
      SELECT 1 FROM user_notification_preferences WHERE user_id = graph_owner_id
    ) THEN
      INSERT INTO notifications (user_id, type, title, message, link_url)
      VALUES (
        graph_owner_id,
        'like',
        'New Like',
        COALESCE(liker_name, 'Someone') || ' liked your emotion graph',
        '/movie/' || movie_id_val::text || '?graph=' || NEW.graph_id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_graph_liked ON likes;
CREATE TRIGGER on_graph_liked
  AFTER INSERT ON likes
  FOR EACH ROW
  WHEN (NEW.graph_id IS NOT NULL)
  EXECUTE FUNCTION notify_graph_liked();

-- Trigger when someone comments on your graph
CREATE OR REPLACE FUNCTION notify_graph_commented()
RETURNS TRIGGER AS $$
DECLARE
  graph_owner_id UUID;
  commenter_name TEXT;
  movie_id_val UUID;
BEGIN
  -- Get the graph owner and movie id
  SELECT user_id, movie_id INTO graph_owner_id, movie_id_val
  FROM emotion_graphs WHERE id = NEW.graph_id;
  
  -- Only notify if someone else commented
  IF NEW.user_id != graph_owner_id THEN
    SELECT display_name INTO commenter_name FROM profiles WHERE id = NEW.user_id;
    
    IF EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = graph_owner_id AND comment_notifications = true
    ) OR NOT EXISTS (
      SELECT 1 FROM user_notification_preferences WHERE user_id = graph_owner_id
    ) THEN
      INSERT INTO notifications (user_id, type, title, message, link_url)
      VALUES (
        graph_owner_id,
        'comment',
        'New Comment',
        COALESCE(commenter_name, 'Someone') || ' commented on your emotion graph',
        '/movie/' || movie_id_val::text || '?graph=' || NEW.graph_id::text
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_graph_commented ON comments;
CREATE TRIGGER on_graph_commented
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.graph_id IS NOT NULL)
  EXECUTE FUNCTION notify_graph_commented();

-- Trigger when someone follows you
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT display_name INTO follower_name FROM profiles WHERE id = NEW.follower_id;
  
  IF EXISTS (
    SELECT 1 FROM user_notification_preferences 
    WHERE user_id = NEW.following_id AND follow_notifications = true
  ) OR NOT EXISTS (
    SELECT 1 FROM user_notification_preferences WHERE user_id = NEW.following_id
  ) THEN
    INSERT INTO notifications (user_id, type, title, message, link_url)
    VALUES (
      NEW.following_id,
      'follow',
      'New Follower',
      COALESCE(follower_name, 'Someone') || ' started following you',
      '/profile?user=' || NEW.follower_id::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_new_follower ON followers;
CREATE TRIGGER on_new_follower
  AFTER INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();

-- Enable realtime for notifications, comments, and likes
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;

-- PHASE 6: Onboarding
-- Add onboarding completion flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;