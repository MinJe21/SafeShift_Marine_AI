"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SmartphoneNfc } from "lucide-react";

export default function CrewLogin() {
  const router = useRouter();
  const { crew, loginAsCrew } = useAppStore();

  const handleNfcLogin = (crewId: string) => {
    loginAsCrew(crewId);
    router.push("/crew");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">선원 인증</h1>
        <p className="text-lg text-slate-600">NFC 태그 시뮬레이션을 통해 선원 계정으로 로그인합니다.</p>
      </div>

      <Card className="w-full max-w-3xl shadow-lg border-slate-200">
        <CardHeader className="text-center pb-6 border-b bg-slate-50/50">
          <div className="mx-auto bg-blue-100 p-5 rounded-full mb-4 shadow-sm">
            <SmartphoneNfc className="w-14 h-14 text-blue-700" />
          </div>
          <CardTitle className="text-2xl text-slate-800">NFC 사원증 태그</CardTitle>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {crew.map(member => (
            <Button 
              key={member.id}
              variant="outline"
              size="lg"
              className="h-24 text-lg justify-start px-6 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
              onClick={() => handleNfcLogin(member.id)}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-xl text-slate-900">{member.name}</span>
                <span className="text-base text-slate-500 font-medium mt-1">{member.role}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Button variant="ghost" size="lg" className="mt-10 text-slate-500 hover:text-slate-800" onClick={() => router.push("/")}>
        홈으로 돌아가기
      </Button>
    </main>
  );
}
