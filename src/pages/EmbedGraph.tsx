import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmotionTimelineGraph from "@/components/EmotionTimelineGraph";

const EmbedGraph = () => {
  const { graphId } = useParams();
  const [graph, setGraph] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (graphId) {
      fetchGraph();
    }
  }, [graphId]);

  const fetchGraph = async () => {
    try {
      const { data: graphData, error: graphError } = await supabase
        .from("emotion_graphs")
        .select(`
          *,
          movies (title),
          profiles (display_name)
        `)
        .eq("id", graphId)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .single();

      if (graphError) throw graphError;

      setGraph(graphData);
      setMovie(graphData.movies);
    } catch (error) {
      console.error("Error fetching graph:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading graph...</p>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Graph not found</p>
      </div>
    );
  }

  const layers = [
    {
      name: graph.profiles?.display_name || "User",
      data: graph.graph_data,
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold">{movie?.title}</h2>
          <p className="text-sm text-muted-foreground">
            Emotion graph by {graph.profiles?.display_name}
          </p>
        </div>
        
        <EmotionTimelineGraph
          layers={layers}
          movieTitle={movie?.title || "Movie"}
          height={400}
        />

        <div className="mt-4 text-center">
          <a
            href={`${window.location.origin}/movie/${graph.movie_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            View full movie details →
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmbedGraph;