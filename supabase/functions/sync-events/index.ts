import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { events } = await req.json();

    if (!events || !Array.isArray(events)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Sort events by logical clock to ensure correct order of state transition
    events.sort((a, b) => a.logical_clock - b.logical_clock);

    for (const event of events) {
      // 1. Insert event (idempotency key ensures no dupes via UNIQUE constraint)
      const { error: eventError } = await supabase
        .from('task_events')
        .insert({
          event_id: event.event_id,
          task_id: event.task_id,
          crew_id: event.crew_id,
          vessel_id: event.vessel_id,
          event_type: event.event_type,
          zone_id: event.zone_id,
          status_from: event.status_from,
          status_to: event.status_to,
          device_timestamp: event.device_timestamp,
          logical_clock: event.logical_clock,
          idempotency_key: event.idempotency_key,
          sync_status: 'SYNCED'
        });

      if (eventError && eventError.code !== '23505') { // 23505 is unique violation
        console.error('Error inserting event:', eventError);
        continue; 
      }

      // 2. Update Task Status if status_to exists
      if (event.status_to) {
        await supabase
          .from('tasks')
          .update({ status: event.status_to })
          .eq('task_id', event.task_id);
      }

      // 3. Audit Log
      await supabase
        .from('audit_logs')
        .insert({
          actor_id: event.crew_id,
          action: event.event_type,
          target_type: 'task',
          target_id: event.task_id,
          after_json: event
        });
    }

    return new Response(JSON.stringify({ success: true, processed: events.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
