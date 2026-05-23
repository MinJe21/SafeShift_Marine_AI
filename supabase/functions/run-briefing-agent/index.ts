import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';
import { runMockAgent } from '../_shared/mockAgent.ts';
import { getGeminiModel } from '../_shared/geminiClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { task_id } = await req.json();

    // 1. Initialize run
    const { runId, logToolCall } = await runMockAgent(req, task_id, 'Generate safety briefing for task');

    // 2. Fetch real Task Data
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        schedules (
          work_date,
          preset_type
        )
      `)
      .eq('task_id', task_id)
      .single();

    if (taskError) throw taskError;

    const scheduleData = await logToolCall(
      'get_schedule',
      { task_id },
      {
        title: taskData.title,
        description: taskData.description,
        schedule: taskData.schedules
      },
      'Retrieved actual schedule and task details from database.'
    );

    // 3. Fetch recent Near Miss logs
    const { data: recentNearMisses } = await supabase
      .from('near_miss_logs')
      .select('raw_text, category, severity')
      .order('created_at', { ascending: false })
      .limit(3);

    const nearMissData = await logToolCall(
      'get_near_miss_history',
      {},
      { recent_issues: recentNearMisses || [] },
      'Retrieved recent real near-miss logs from database.'
    );

    // 4. Mock Weather (For now, use fixed weather context)
    const weatherData = await logToolCall(
      'get_weather_condition',
      { location: '작업 현장' },
      { wind: '12m/s', wave: '1.5m', condition: '거친 파도' },
      'Simulated checking sea conditions.'
    );

    // 5. Call Gemini
    let briefingContent = "";
    try {
      const model = getGeminiModel('gemini-2.5-flash');
      const prompt = `
당신은 해상 안전 관리 AI 에이전트입니다. 다음 작업 스케줄, 최근 위험 이력, 그리고 현재 날씨를 기반으로 작업자를 위한 안전 브리핑을 3문장 이내의 한국어로 작성해 주세요. 
말투는 현장 작업 반장처럼 명확하고 주의를 당부하는 어조여야 합니다.

[작업 정보]
작업명: ${taskData.title}
상세: ${taskData.description}
작업위치: 작업 현장

[최근 위험 이력 (참고용)]
${recentNearMisses?.map((n: any) => `- ${n.category} (${n.severity}): ${n.raw_text}`).join('\n') || '최근 이력 없음'}

[현재 날씨]
풍속: 12m/s, 파고: 1.5m (거친 파도)
      `;

      const result = await model.generateContent(prompt);
      briefingContent = result.response.text();
    } catch (geminiError: any) {
      console.error('Gemini Error:', geminiError);
      briefingContent = "Gemini API 오류가 발생했습니다. 환경변수에 GEMINI_API_KEY가 올바르게 설정되었는지 확인해 주세요. (임시 브리핑: 파고가 높으니 항상 안전 장구를 착용하세요.)";
    }

    const briefingResult = await logToolCall('generate_briefing', { scheduleData, nearMissData, weatherData }, { content: briefingContent }, 'Generated final text using Gemini API.');

    // 6. Save briefing
    await supabase.from('safety_briefings').insert({
      task_id,
      content: briefingContent,
      source_schedule: scheduleData,
      source_near_miss: nearMissData,
      source_weather: weatherData,
      generated_by: 'gemini_agent'
    });

    // 7. Complete run
    await supabase.from('agent_runs').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('run_id', runId);

    return new Response(JSON.stringify({ success: true, briefing: briefingContent }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});



