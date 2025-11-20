import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataPoint {
  t_offset: number;
  score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or moderator role
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin or moderator access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { movieId } = await req.json();

    if (!movieId) {
      return new Response(
        JSON.stringify({ error: 'movieId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting aggregation for movie: ${movieId}`);

    // Fetch all approved public emotion graphs for this movie
    const { data: graphs, error: graphsError } = await supabase
      .from('emotion_graphs')
      .select('*')
      .eq('movie_id', movieId)
      .eq('is_public', true)
      .eq('moderation_status', 'approved')
      .in('source_type', ['live_reaction', 'manual_review', 'nlp_analysis']);

    if (graphsError) {
      console.error('Error fetching graphs:', graphsError);
      throw graphsError;
    }

    if (!graphs || graphs.length === 0) {
      console.log('No graphs found to aggregate');
      return new Response(
        JSON.stringify({ message: 'No graphs to aggregate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${graphs.length} graphs to aggregate`);

    // Weight different source types
    const weights = {
      live_reaction: 1.0,
      manual_review: 0.8,
      nlp_analysis: 0.6,
    };

    // Aggregate data points
    const aggregatedPoints: Map<number, { sum: number; weight: number }> = new Map();

    graphs.forEach(graph => {
      const weight = weights[graph.source_type as keyof typeof weights] || 0.5;
      const data = graph.graph_data as DataPoint[];

      data.forEach(point => {
        const t = Math.round(point.t_offset * 10) / 10; // Round to 1 decimal
        const existing = aggregatedPoints.get(t) || { sum: 0, weight: 0 };
        aggregatedPoints.set(t, {
          sum: existing.sum + point.score * weight,
          weight: existing.weight + weight,
        });
      });
    });

    // Calculate weighted average and sort
    const consensusData: DataPoint[] = Array.from(aggregatedPoints.entries())
      .map(([t_offset, { sum, weight }]) => ({
        t_offset,
        score: sum / weight,
      }))
      .sort((a, b) => a.t_offset - b.t_offset);

    // Apply smoothing (moving average)
    const smoothedData = smoothData(consensusData, 5);

    // Check if consensus graph already exists
    const { data: existingGraph } = await supabase
      .from('emotion_graphs')
      .select('id')
      .eq('movie_id', movieId)
      .eq('source_type', 'consensus')
      .maybeSingle();

    if (existingGraph) {
      // Update existing
      const { error: updateError } = await supabase
        .from('emotion_graphs')
        .update({
          graph_data: smoothedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGraph.id);

      if (updateError) throw updateError;
      console.log('Updated existing consensus graph');
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from('emotion_graphs')
        .insert({
          movie_id: movieId,
          source_type: 'consensus',
          graph_data: smoothedData,
          is_public: true,
          moderation_status: 'approved',
          user_id: null, // System-generated
        });

      if (insertError) throw insertError;
      console.log('Created new consensus graph');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pointsAggregated: consensusData.length,
        graphsUsed: graphs.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in aggregate-emotion-graphs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function smoothData(data: DataPoint[], windowSize: number): DataPoint[] {
  if (data.length < windowSize) return data;

  const smoothed: DataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const avgScore = window.reduce((sum, p) => sum + p.score, 0) / window.length;
    smoothed.push({
      t_offset: data[i].t_offset,
      score: avgScore,
    });
  }
  return smoothed;
}
