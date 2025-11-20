-- Fix security: Set search_path for the function
ALTER FUNCTION generate_sample_emotion_data(INTEGER, NUMERIC, TEXT[]) 
SET search_path = public;