import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';
import { runMockAgent } from '../_shared/mockAgent.ts';
import { getGeminiModel } from '../_shared/geminiClient.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { task_id, crew_id, vessel_id, raw_text } = await req.json();

    const { runId, logToolCall } = await runMockAgent(req, task_id, 'Classify Near Miss Memo');

    let category = 'OTHER';
    let severity = 'LOW';
    let confidence = 0.5;

    try {
      const model = getGeminiModel('gemini-2.5-flash');
      const prompt = `
당신은 해상 안전 관리 시스템의 아차사고(Near-Miss) 분류 AI입니다.
다음 작업자의 메모를 분석하여 가장 적절한 카테고리로 분류하세요.

허용된 카테고리 (반드시 아래 중 하나만 선택):
- EQUIPMENT_FAILURE (장비/기계 결함)
- FIRE_EXPLOSION (화재/폭발)
- WEATHER_RISK (날씨/기상 악화)
- SLIP_FALL (미끄러짐/추락)
- COLLISION (충돌/접촉)
- OTHER (기타)

위험도 (severity): HIGH, MEDIUM, LOW 중 택일
확신도 (confidence): 0.0 ~ 1.0 사이의 숫자

[작업자 메모]
"${raw_text}"

반드시 아래 JSON 형식으로만 응답하세요. (마크다운 백틱 없이 순수 JSON만)
{"category": "카테고리명", "severity": "위험도", "confidence": 숫자}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(text);

      category = parsed.category || 'OTHER';
      severity = parsed.severity || 'MEDIUM';
      confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5;

    } catch (geminiError: any) {
      console.error('Gemini Classification Error:', geminiError);
      // Fallback to simple keyword logic if Gemini fails
      if (raw_text.includes('로프') || raw_text.includes('장비')) {
        category = 'EQUIPMENT_FAILURE'; severity = 'HIGH'; confidence = 0.8;
      } else if (raw_text.includes('불') || raw_text.includes('연기')) {
        category = 'FIRE_EXPLOSION'; severity = 'HIGH'; confidence = 0.9;
      } else if (raw_text.includes('날씨') || raw_text.includes('파도')) {
        category = 'WEATHER_RISK'; severity = 'MEDIUM'; confidence = 0.7;
      } else if (raw_text.includes('부딪')) {
        category = 'COLLISION'; severity = 'MEDIUM'; confidence = 0.7;
      }
    }

    const humanReview = confidence < 0.75;

    await logToolCall('classify_near_miss', { text: raw_text }, { category, severity, confidence }, 'Analyzed text using Gemini API.');

    const { data: nearMissData, error: nearMissError } = await supabase
      .from('near_miss_logs')
      .insert({
        task_id,
        crew_id,
        vessel_id,
        raw_text,
        category,
        severity,
        confidence,
        human_review_required: humanReview
      })
      .select()
      .single();

    if (nearMissError) throw nearMissError;

    await supabase.from('agent_runs').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('run_id', runId);

    return new Response(JSON.stringify({ success: true, nearMiss: nearMissData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
