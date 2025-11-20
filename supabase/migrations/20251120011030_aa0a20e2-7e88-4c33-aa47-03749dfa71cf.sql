-- Add movie_id column to comments table to support movie-level comments
ALTER TABLE comments ADD COLUMN movie_id uuid REFERENCES movies(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);

-- Update check constraint to ensure either graph_id, review_id, or movie_id is set
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_target_check;
ALTER TABLE comments ADD CONSTRAINT comments_target_check 
  CHECK (
    (graph_id IS NOT NULL AND review_id IS NULL AND movie_id IS NULL) OR
    (graph_id IS NULL AND review_id IS NOT NULL AND movie_id IS NULL) OR
    (graph_id IS NULL AND review_id IS NULL AND movie_id IS NOT NULL)
  );

-- Add RLS policy for movie-level comments
CREATE POLICY "Movie comments are viewable" ON comments
  FOR SELECT
  USING (
    movie_id IS NOT NULL 
    AND moderation_status = 'approved'
  );