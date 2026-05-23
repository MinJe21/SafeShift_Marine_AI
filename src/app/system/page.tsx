"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Terminal, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function SystemDashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('tool_call_logs').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) setLogs(data);
    };
    fetchLogs();

    // Set up realtime
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tool_call_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-green-400" />
            Agent Console & Offline Monitor
          </h1>
          <Button variant="outline" onClick={() => router.push("/")} className="text-black bg-white">
            홈으로 가기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-green-400">실시간 Agent 호출 로그</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-slate-700">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">대기 중...</div>
                  ) : logs.map((log) => (
                    <div key={log.log_id} className="p-4 hover:bg-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {log.tool_name}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {log.reason}
                      </p>
                      <div className="bg-slate-900 p-2 rounded text-xs font-mono text-slate-400 overflow-x-auto">
                        <span className="text-slate-500">Input: </span>
                        {JSON.stringify(log.input_json)}
                        <br/>
                        <span className="text-slate-500">Output: </span>
                        {JSON.stringify(log.output_json)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5" />
                  Offline Queue Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center p-8 bg-slate-900 rounded-lg border border-slate-700">
                  <p className="text-lg text-slate-400 mb-2">네트워크 상태</p>
                  <p className="text-2xl font-bold text-green-500 mb-6">ONLINE</p>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">대기 중인 이벤트</span>
                    <span className="text-white font-mono">0</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500">동기화 완료</span>
                    <span className="text-white font-mono">All Synced</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  * MVP 데모용 시뮬레이터: 실제 네트워크 단절 시 IndexedDB에 PENDING 상태로 적재되며 복구 시 /sync-events를 호출합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
