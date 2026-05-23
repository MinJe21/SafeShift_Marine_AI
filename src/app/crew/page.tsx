"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, ShieldAlert, MapPin, Mic, LogOut, Info, Clock, CloudRain, StickyNote } from "lucide-react";

export default function CrewDashboard() {
  const router = useRouter();
  const { currentUser, isCaptain, tasks, updateTaskStatus, reportTaskIssue, logout, currentPreset } = useAppStore();
  
  const [riskMemo, setRiskMemo] = useState("");
  const [showRiskModalFor, setShowRiskModalFor] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    if (!currentUser && !isCaptain) {
      router.push("/crew/login");
    }
  }, [currentUser, isCaptain, router]);

  if (!currentUser) return null;

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <Badge variant="secondary">예정됨</Badge>;
      case 'ASSIGNED': return <Badge variant="outline">할당됨</Badge>;
      case 'SAFETY_CONFIRMED': return <Badge variant="default">안전 확인됨</Badge>;
      case 'ZONE_CHECKED_IN': return <Badge variant="warning">작업 중</Badge>;
      case 'POST_TASK_CHECK': return <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50">마무리 점검 중</Badge>;
      case 'COMPLETED': return <Badge variant="success">완료됨</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getConditionInfo = (preset: string) => {
    switch(preset) {
      case 'heavy_weather':
        return {
          weather: '파고 3~4m, 풍속 25노트 (황천 발생)',
          notes: '갑판 상부 작업 시 파도 휩쓸림 주의. 이동 시 반드시 구명줄 체결할 것.'
        };
      case 'port_arrival':
        return {
          weather: '맑음, 풍속 5노트 미만',
          notes: '항내 타 선박 및 소형 어선 접근 주의. 견시 철저 및 갑판 정리정돈 필수.'
        };
      default:
        return {
          weather: '맑음, 파고 1m 내외',
          notes: '특이사항 없음. 통상적인 안전 수칙 준수.'
        };
    }
  };

  const getChecklistItems = (preset: string) => {
    const baseItems = [
      { id: 'helmet', label: '안전모 착용' },
      { id: 'shoes', label: '안전화 착용' },
      { id: 'gloves', label: '작업용 장갑 착용' },
    ];
    if (preset === 'heavy_weather') {
      return [...baseItems, 
        { id: 'harness', label: '안전대 및 구명줄 착용' },
        { id: 'vest', label: '구명조끼 착용' },
        { id: 'radio', label: 'VHF 무전기 상태 확인' }
      ];
    }
    if (preset === 'port_arrival') {
      return [...baseItems, 
        { id: 'vest', label: '형광 조끼 착용' },
        { id: 'radio', label: 'UHF 무전기 상태 확인' }
      ];
    }
    return baseItems;
  };

  const getPostChecklistItems = () => [
    { id: 'cleanup', label: '작업 구역 정리정돈 및 청소 완료' },
    { id: 'tools', label: '사용 공구 수량 확인 및 반납' },
    { id: 'power', label: '전원 및 밸브 차단 상태 확인' },
  ];

  const renderTaskAction = (task: any) => {
    const toggleCheck = (itemId: string, prefix = '') => {
      const key = `${prefix}${task.id}`;
      setCheckedItems(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [itemId]: !prev[key]?.[itemId]
        }
      }));
    };

    if (task.status === 'SCHEDULED' || task.status === 'ASSIGNED') {
      const condition = getConditionInfo(currentPreset);
      const checklist = getChecklistItems(currentPreset);
      const taskCheckedState = checkedItems[`pre_${task.id}`] || {};
      const allChecked = checklist.every(item => taskCheckedState[item.id]);

      return (
        <Card className="mt-5 border-blue-200 bg-blue-50/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-blue-100 bg-white">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-blue-600" />
              <CardTitle className="text-xl text-blue-900">작업 전 안전 교육 및 체크리스트</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 flex flex-col gap-5">
            {/* Context Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex items-start gap-3">
                <CloudRain className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <strong className="text-slate-800 block mb-1">기상 상황</strong>
                  <p className="text-sm text-slate-600">{condition.weather}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex items-start gap-3">
                <StickyNote className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <strong className="text-slate-800 block mb-1">작업 특이사항</strong>
                  <p className="text-sm text-slate-600 text-red-600 font-medium">{condition.notes}</p>
                </div>
              </div>
            </div>

            <p className="text-blue-800 text-base mt-2">
              <strong>{task.zone}</strong> 작업을 시작하기 전 위 사항을 숙지하고, 아래 필수 안전장비 착용 여부를 모두 체크해 주세요.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-5 rounded-lg border border-blue-100 shadow-inner">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-slate-50 cursor-pointer"
                    checked={taskCheckedState[item.id] || false}
                    onChange={() => toggleCheck(item.id, 'pre_')}
                  />
                  <span className={`text-lg ${taskCheckedState[item.id] ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end mt-2">
              <Button 
                size="lg" 
                onClick={() => updateTaskStatus(task.id, 'SAFETY_CONFIRMED')} 
                className={`w-full md:w-auto text-lg px-8 ${!allChecked ? 'bg-slate-300 text-slate-500 hover:bg-slate-300 cursor-not-allowed border-transparent' : 'shadow-md'}`}
                disabled={!allChecked}
              >
                {allChecked ? '확인 및 서명 완료' : '모든 항목을 체크하세요'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (task.status === 'SAFETY_CONFIRMED') {
      return (
        <Card className="mt-5 border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
                <MapPin className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h5 className="font-bold text-amber-900 text-lg">구역 체크인 필요</h5>
                <p className="text-amber-800 mt-1">
                  지정된 {task.zone} 앵커에 NFC 기기를 태그하여 위치를 인증하세요.
                </p>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white w-full md:w-auto shadow-md" onClick={() => updateTaskStatus(task.id, 'ZONE_CHECKED_IN')}>
              NFC 체크인 시뮬레이션
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (task.status === 'ZONE_CHECKED_IN') {
      return (
        <div className="mt-6 flex flex-wrap gap-4">
          <Button size="lg" className="flex-1 min-w-[200px] bg-teal-600 hover:bg-teal-700 text-white shadow-md text-base" onClick={() => updateTaskStatus(task.id, 'POST_TASK_CHECK')}>
            <CheckCircle2 className="w-6 h-6 mr-2" /> 작업 종료 및 마무리 점검
          </Button>
          <Button size="lg" variant="outline" className="flex-1 min-w-[160px] border-amber-400 text-amber-800 hover:bg-amber-50 shadow-sm text-base bg-white" onClick={() => reportTaskIssue(task.id, 'DELAYED')}>
            <Clock className="w-6 h-6 mr-2 text-amber-600" /> 지연 보고
          </Button>
          <Button size="lg" variant="destructive" className="flex-1 min-w-[160px] shadow-md text-base" onClick={() => setShowRiskModalFor(task.id)}>
            <AlertTriangle className="w-6 h-6 mr-2" /> 위험 보고
          </Button>
        </div>
      );
    }

    if (task.status === 'POST_TASK_CHECK') {
      const checklist = getPostChecklistItems();
      const taskCheckedState = checkedItems[`post_${task.id}`] || {};
      const allChecked = checklist.every(item => taskCheckedState[item.id]);

      return (
        <Card className="mt-5 border-teal-200 bg-teal-50/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-teal-100 bg-white">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-teal-600" />
              <CardTitle className="text-xl text-teal-900">작업 후 마무리 체크리스트</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 flex flex-col gap-5">
            <p className="text-teal-800 text-base">
              작업을 완전히 종료하기 전, 아래 항목이 모두 완료되었는지 확인해 주세요.
            </p>
            
            <div className="flex flex-col gap-3 bg-white p-5 rounded-lg border border-teal-100 shadow-inner">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-4 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors border border-transparent hover:border-slate-200">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded border-slate-300 text-teal-600 focus:ring-teal-500 bg-slate-50 cursor-pointer"
                    checked={taskCheckedState[item.id] || false}
                    onChange={() => toggleCheck(item.id, 'post_')}
                  />
                  <span className={`text-lg ${taskCheckedState[item.id] ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end mt-2">
              <Button 
                size="lg" 
                onClick={() => updateTaskStatus(task.id, 'COMPLETED')} 
                className={`w-full md:w-auto text-lg px-8 ${!allChecked ? 'bg-slate-300 text-slate-500 hover:bg-slate-300 cursor-not-allowed border-transparent' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'}`}
                disabled={!allChecked}
              >
                {allChecked ? '최종 작업 완료' : '마무리 점검을 완료하세요'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-xl shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{currentUser.name}</h1>
            <p className="text-blue-200 text-sm font-medium">{currentUser.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-blue-100 hover:bg-blue-800 hover:text-white rounded-full w-12 h-12">
          <LogOut className="w-6 h-6" />
        </Button>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
          내 할당 작업
        </h2>

        {myTasks.length === 0 ? (
          <Card className="text-center p-16 shadow-sm border-slate-200">
            <Info className="w-20 h-20 mx-auto text-slate-300 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-700">할당된 작업 없음</h3>
            <p className="text-slate-500 mt-3 text-lg">오늘 예정된 작업이 없습니다.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-8">
            {myTasks.map(task => (
              <Card key={task.id} className={`border-l-8 ${task.status === 'COMPLETED' ? 'border-l-teal-500 opacity-80' : 'border-l-blue-600 shadow-lg'}`}>
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2 text-slate-900">{task.title}</CardTitle>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <MapPin className="w-5 h-5 text-slate-400" /> {task.zone}
                      </div>
                    </div>
                    <div className="scale-110 origin-top-right">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-lg">
                    {task.description}
                  </p>
                  
                  {task.issueType !== 'NONE' && (
                    <div className="mb-6 bg-red-50 text-red-900 p-4 rounded-lg border border-red-200 flex items-start gap-3 shadow-sm">
                      <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
                      <div>
                        <strong className="text-lg block mb-1">{task.issueType === 'RISK' ? '위험' : '지연'} 보고됨</strong> 
                        <span className="text-slate-700">{task.issueMemo || '메모가 제공되지 않았습니다.'}</span>
                      </div>
                    </div>
                  )}

                  {renderTaskAction(task)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mock Risk Modal */}
        {showRiskModalFor && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl shadow-2xl border-0">
              <CardHeader className="bg-red-50 text-red-900 border-b border-red-100 p-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Mic className="w-8 h-8 text-red-600" /> 위험 메모 녹음
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-base text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  태블릿에 음성으로 위험 요소를 보고하는 상황을 시뮬레이션합니다. AI가 음성을 텍스트로 자동 변환합니다.
                </p>
                <textarea
                  className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none mb-6 resize-none text-lg shadow-inner bg-white"
                  placeholder="예: 좌현 엔진 근처에서 오일 누출 발견..."
                  value={riskMemo}
                  onChange={(e) => setRiskMemo(e.target.value)}
                />
                <div className="flex gap-4 justify-end">
                  <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => {
                    setShowRiskModalFor(null);
                    setRiskMemo("");
                  }}>취소</Button>
                  <Button size="lg" variant="destructive" className="text-lg px-8 shadow-md" onClick={() => {
                    reportTaskIssue(showRiskModalFor, 'RISK', riskMemo);
                    setShowRiskModalFor(null);
                    setRiskMemo("");
                  }}>
                    보고서 제출
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
