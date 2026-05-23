import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';
import { evaluateRules } from '../_shared/ruleEngine.ts';
import { runMockAgent } from '../_shared/mockAgent.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { task_id, draft_message, ai_severity } = await req.json();

    const { runId, logToolCall } = await runMockAgent(req, task_id, 'Evaluate and Send Alert');

    const { data: taskData } = await supabase.from('tasks').select('status').eq('task_id', task_id).single();
    const taskStatus = taskData?.status || 'UNKNOWN';

    await logToolCall('send_alert', { draft_message, ai_severity }, { pending_rule_engine: true }, 'Drafting alert for rule engine.');

    const { status: finalStatus, reason } = evaluateRules(draft_message, ai_severity, taskStatus);

    await logToolCall('send_alert', { rule_engine_result: { finalStatus, reason } }, { sent: finalStatus === 'APPROVED' }, 'Rule engine applied.');

    const { data: alertData, error: alertError } = await supabase
      .from('alerts')
      .insert({
        task_id,
        draft_message,
        ai_severity,
        rule_engine_result: reason,
        status: finalStatus
      })
      .select()
      .single();

    if (alertError) throw alertError;

    await supabase.from('agent_runs').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('run_id', runId);

    return new Response(JSON.stringify({ success: true, alert: alertData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
