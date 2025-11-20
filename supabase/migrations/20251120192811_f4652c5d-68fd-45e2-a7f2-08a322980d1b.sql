-- Generate sample emotion timeline graphs for all movies without graphs
-- This creates realistic emotional arcs based on movie metadata

-- Function to generate sample emotion data points
CREATE OR REPLACE FUNCTION generate_sample_emotion_data(
  movie_runtime INTEGER,
  movie_rating NUMERIC,
  movie_genres TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  data_points JSONB := '[]'::JSONB;
  num_points INTEGER;
  i INTEGER;
  time_offset INTEGER;
  base_value NUMERIC;
  current_value NUMERIC;
  peak_position NUMERIC;
  is_action BOOLEAN;
  is_drama BOOLEAN;
BEGIN
  -- Determine number of data points based on runtime (one per 5 minutes)
  num_points := GREATEST(12, LEAST(30, COALESCE(movie_runtime, 120) / 5));
  
  -- Check genres for curve shaping
  is_action := movie_genres && ARRAY['Action', 'Thriller', 'Adventure'];
  is_drama := movie_genres && ARRAY['Drama', 'Romance'];
  
  -- Base value influenced by rating
  base_value := COALESCE(movie_rating, 7.0);
  
  -- Peak typically happens at 70-80% through the movie
  peak_position := 0.75;
  
  -- Generate data points
  FOR i IN 0..num_points-1 LOOP
    time_offset := (i::NUMERIC / (num_points - 1) * COALESCE(movie_runtime, 120))::INTEGER;
    
    -- Create emotional arc
    IF i::NUMERIC / num_points < 0.2 THEN
      -- Opening: moderate emotion, building
      current_value := base_value + RANDOM() * 0.5;
    ELSIF i::NUMERIC / num_points < peak_position THEN
      -- Rising action: steadily increasing
      current_value := base_value + ((i::NUMERIC / num_points / peak_position) * 2.5) + RANDOM() * 0.7;
    ELSIF i::NUMERIC / num_points < 0.85 THEN
      -- Climax: peak emotion
      current_value := base_value + 3.0 + RANDOM() * 1.0;
    ELSE
      -- Resolution: settling down
      current_value := base_value + 1.5 + RANDOM() * 0.8;
    END IF;
    
    -- Add genre-specific variations
    IF is_action THEN
      current_value := current_value + (RANDOM() - 0.5) * 1.5; -- More volatility
    END IF;
    
    -- Clamp values between 1 and 10
    current_value := GREATEST(1, LEAST(10, current_value));
    
    -- Add data point
    data_points := data_points || jsonb_build_object(
      'time', time_offset,
      'value', ROUND(current_value::NUMERIC, 1)
    );
  END LOOP;
  
  RETURN data_points;
END;
$$ LANGUAGE plpgsql;

-- Insert sample emotion graphs for movies without any graphs
INSERT INTO emotion_graphs (movie_id, source_type, graph_data, is_public, moderation_status, user_id)
SELECT 
  m.id,
  'consensus'::graph_source_type,
  generate_sample_emotion_data(m.runtime, m.rating, m.genres),
  true,
  'approved'::moderation_status,
  NULL
FROM movies m
WHERE NOT EXISTS (
  SELECT 1 FROM emotion_graphs eg 
  WHERE eg.movie_id = m.id 
  AND eg.source_type = 'consensus'
);