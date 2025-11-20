import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { movieId, reviewText, runtime } = await req.json();

    if (!movieId || !reviewText || !runtime) {
      return new Response(
        JSON.stringify({ error: 'movieId, reviewText, and runtime are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing NLP review for movie: ${movieId}, runtime: ${runtime}min`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use Lovable AI to analyze the review
    const systemPrompt = `You are an expert at analyzing movie reviews and extracting emotional sentiment over time.

Given a movie review and its runtime, extract emotion scores at different points throughout the movie.

Return a JSON array of data points with this structure:
[
  { "t_offset": 0, "score": 5 },
  { "t_offset": 10, "score": 6 },
  ...
]

Where:
- t_offset: percentage of movie progress (0-100)
- score: emotional score from 0-10 (0=very negative, 5=neutral, 10=very positive)

Extract at least 10-20 data points spread across the movie timeline. Infer timestamps from temporal references in the review (e.g., "at the beginning", "halfway through", "in the climax", "at the end").`;

    const userPrompt = `Review: ${reviewText}

Movie Runtime: ${runtime} minutes

Analyze this review and extract emotion scores at different points throughout the movie timeline. Return ONLY a valid JSON array.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI processing failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response:', content);

    // Parse the AI response (handle JSON wrapped in markdown)
    let graphData;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      graphData = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate data structure
    if (!Array.isArray(graphData) || graphData.length === 0) {
      throw new Error('Invalid graph data format from AI');
    }

    // Sort by t_offset
    graphData.sort((a: any, b: any) => a.t_offset - b.t_offset);

    console.log(`Generated ${graphData.length} data points`);

    // Save to emotion_graphs table
    const { data: insertedGraph, error: insertError } = await supabase
      .from('emotion_graphs')
      .insert({
        movie_id: movieId,
        source_type: 'nlp_analysis',
        graph_data: graphData,
        is_public: true,
        moderation_status: 'approved',
        user_id: null, // Admin-generated
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting graph:', insertError);
      throw insertError;
    }

    console.log('Successfully created NLP emotion graph');

    return new Response(
      JSON.stringify({ 
        success: true, 
        graphId: insertedGraph.id,
        dataPoints: graphData.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-nlp-reviews:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
