"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Anchor, ShieldCheck, Terminal } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { loginAsCaptain, fetchInitialData } = useAppStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCaptainLogin = () => {
    loginAsCaptain();
    router.push("/captain");
  };

  const handleCrewLogin = () => {
    router.push("/crew/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl w-full text-center mb-12">
        <div className="flex justify-center mb-6">
          <Anchor className="w-16 h-16 text-blue-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          SafeShift Marine AI
        </h1>
        <p className="text-lg md:text-xl text-slate-600">
          선상 작업 및 안전 컴플라이언스 플랫폼
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card 
          className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group"
          onClick={handleCaptainLogin}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-blue-50 group-hover:bg-blue-100 transition-colors p-6 rounded-full mb-4">
              <ShieldCheck className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">선장(관리자) 모드</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-slate-600 text-lg">
            선원 안전 모니터링, 작업 진행 상황 확인 및 일일 작업 관리
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all group"
          onClick={handleCrewLogin}
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-teal-50 group-hover:bg-teal-100 transition-colors p-6 rounded-full mb-4">
              <Anchor className="w-16 h-16 text-teal-600" />
            </div>
            <CardTitle className="text-3xl">선원(작업자) 모드</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-slate-600 text-lg">
            NFC 로그인, 맞춤형 안전교육 확인 및 현장 작업 상태 업데이트
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Button variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-100" onClick={() => router.push("/system")}>
          <Terminal className="w-4 h-4 mr-2" /> Agent Console & System Monitor
        </Button>
      </div>
    </main>
  );
}
