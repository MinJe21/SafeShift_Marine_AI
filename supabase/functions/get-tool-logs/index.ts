import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { data, error } = await supabase.from('tool_call_logs').select('*').order('created_at', { ascending: false }).limit(50);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, logs: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
