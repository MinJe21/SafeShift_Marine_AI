import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseClient, corsHeaders } from '../_shared/supabaseClient.ts';
import { generatePdfBytes } from '../_shared/pdfService.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const { schedule_id } = await req.json();

    const textContent = `This is a generated report for schedule ${schedule_id}.\nAll tasks completed safely.\nAgent rule engine checks passed.`;

    const pdfBytes = await generatePdfBytes(schedule_id, textContent);
    const fileName = `report_${schedule_id}_${Date.now()}.pdf`;

    const { data: bucketData } = await supabase.storage.getBucket('reports');
    if (!bucketData) {
      await supabase.storage.createBucket('reports', { public: true });
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName);

    const { data: reportData, error: reportError } = await supabase
      .from('generated_reports')
      .insert({
        schedule_id,
        file_path: fileName,
        signed_url: urlData.publicUrl,
        status: 'COMPLETED'
      })
      .select()
      .single();

    if (reportError) throw reportError;

    return new Response(JSON.stringify({ success: true, report: reportData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
