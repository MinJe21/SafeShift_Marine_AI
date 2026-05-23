import { getSupabaseClient } from './supabaseClient.ts';

export const runMockAgent = async (req: Request, taskId: string, objective: string) => {
  const supabase = getSupabaseClient(req);

  // 1. Create agent_run
  const { data: runData, error: runError } = await supabase
    .from('agent_runs')
    .insert({
      task_id: taskId,
      objective: objective,
      status: 'RUNNING'
    })
    .select()
    .single();

  if (runError || !runData) throw runError || new Error('Run creation failed');
  const runId = runData.run_id;

  const logs: any[] = [];

  const logToolCall = async (toolName: string, input: any, output: any, reason: string) => {
    const log = {
      run_id: runId,
      task_id: taskId,
      tool_name: toolName,
      input_json: input,
      output_json: output,
      reason: reason,
      latency_ms: Math.floor(Math.random() * 500) + 100, // mock latency
      success: true
    };
    logs.push(log);
    await supabase.from('tool_call_logs').insert(log);
    return output;
  };

  return { runId, logToolCall };
};
