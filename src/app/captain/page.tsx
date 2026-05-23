"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Anchor, Bell, CheckCircle2, AlertTriangle, Clock, FileText, Ship } from "lucide-react";

export default function CaptainDashboard() {
  const router = useRouter();
  const { isCaptain, tasks, crew, alerts, logout, generateReports, clearAlert, currentPreset, setPreset } = useAppStore();

  useEffect(() => {
    if (!isCaptain) {
      router.push("/");
    }
  }, [isCaptain, router]);

  if (!isCaptain) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <Badge variant="secondary">예정됨</Badge>;
      case 'ASSIGNED': return <Badge variant="outline">할당됨</Badge>;
      case 'SAFETY_CONFIRMED': return <Badge variant="default">안전 확인됨</Badge>;
      case 'ZONE_CHECKED_IN': return <Badge variant="warning">구역 도착(작업 중)</Badge>;
      case 'POST_TASK_CHECK': return <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50">마무리 점검 중</Badge>;
      case 'COMPLETED': return <Badge variant="success">완료됨</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Anchor className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">SafeShift <span className="text-blue-400">선장 모드</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 rounded-md px-3 py-1.5 border border-slate-700">
            <Ship className="w-5 h-5 text-slate-300" />
            <select 
              className="bg-transparent text-white outline-none font-medium cursor-pointer"
              value={currentPreset}
              onChange={(e) => setPreset(e.target.value as any)}
            >
              <option value="default" className="text-slate-900">기본 작업 프리셋</option>
              <option value="heavy_weather" className="text-slate-900">악천후 프리셋</option>
              <option value="port_arrival" className="text-slate-900">입항 프리셋</option>
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            종료
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Main Monitoring Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>작업 진행률</span>
                <span className="text-3xl text-blue-600 font-bold">{progressPercent}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ProgressBar value={progressPercent} className="h-6" />
              <div className="flex justify-between mt-3 text-sm text-slate-500 font-medium">
                <span>{completedTasks} 완료됨</span>
                <span>{totalTasks} 전체 작업</span>
              </div>
            </CardContent>
          </Card>

          {/* Crew & Task Monitoring */}
          <Card className="flex-1">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-slate-700" />
                선원 작업 모니터링
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {tasks.map(task => {
                  const assignee = crew.find(c => c.id === task.assigneeId);
                  return (
                    <div key={task.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-800">{assignee?.name || '미할당'}</span>
                          <span className="text-slate-300">•</span>
                          <span>{task.zone}</span>
                          {task.issueType !== 'NONE' && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-red-600 font-medium">
                                <AlertTriangle className="w-4 h-4" /> 
                                {task.issueType === 'RISK' ? '위험' : '지연'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Alerts & Reports */}
        <div className="flex flex-col gap-6">
          {/* Alerts */}
          <Card className="border-red-200 shadow-md">
            <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 text-red-800">
                <Bell className="w-6 h-6" />
                실시간 알림
                {alerts.length > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs px-2.5 py-1 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  활성 알림 없음
                </div>
              ) : (
                <div className="divide-y divide-red-100">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-5 bg-white hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={alert.type === 'RISK' ? 'destructive' : 'warning'}>
                          {alert.type === 'RISK' ? '위험' : '지연'}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 text-base mb-1">{alert.crewName}</p>
                      <p className="text-sm text-slate-700 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                        "{alert.message}"
                      </p>
                      <Button variant="outline" size="sm" className="w-full text-sm font-medium" onClick={() => clearAlert(alert.id)}>
                        확인 및 지우기
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports Mock */}
          <Card className="mt-auto border-blue-200">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100">
              <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
                <FileText className="w-6 h-6 text-blue-700" />
                일일 마감 보고서
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                오늘의 작업 로그 및 알림을 바탕으로 TBM 일지 및 위험성평가 보고서를 자동 생성합니다.
              </p>
              <Button 
                className="w-full h-12 text-base shadow-sm" 
                onClick={() => {
                  generateReports();
                  alert("✅ TBM 일지 및 위험성평가 보고서가 성공적으로 생성되어 선박 로컬 서버에 저장되었습니다.");
                }}
              >
                보고서 생성
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
