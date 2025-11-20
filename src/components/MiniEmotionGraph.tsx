import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface MiniEmotionGraphProps {
  movieId: string;
}

export const MiniEmotionGraph = ({ movieId }: MiniEmotionGraphProps) => {
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, [movieId]);

  const fetchGraphData = async () => {
    try {
      const { data, error } = await supabase
        .from("emotion_graphs")
        .select("graph_data, source_type")
        .eq("movie_id", movieId)
        .eq("is_public", true)
        .eq("moderation_status", "approved")
        .eq("source_type", "consensus")
        .single();

      if (error) throw error;

      if (data?.graph_data) {
        const formattedData = (data.graph_data as any[]).map((point: any) => ({
          time: point.time,
          value: point.value,
        }));
        setGraphData(formattedData);
      }
    } catch (error) {
      // If no consensus graph, try to get any available graph
      try {
        const { data, error } = await supabase
          .from("emotion_graphs")
          .select("graph_data")
          .eq("movie_id", movieId)
          .eq("is_public", true)
          .eq("moderation_status", "approved")
          .limit(1)
          .single();

        if (data?.graph_data) {
          const formattedData = (data.graph_data as any[]).map((point: any) => ({
            time: point.time,
            value: point.value,
          }));
          setGraphData(formattedData);
        }
      } catch {
        // No graph data available
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || graphData.length === 0) {
    return null;
  }

  return (
    <div className="h-16 w-full -mb-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={graphData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${movieId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill={`url(#gradient-${movieId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
