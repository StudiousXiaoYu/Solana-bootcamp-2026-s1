"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockCheckInService, CheckInStats, Badge } from "@/lib/mock/checkin-service";
import { CheckInButton } from "@/components/features/CheckInButton";
import { StatsDisplay } from "@/components/features/StatsDisplay";
import { BadgeGrid } from "@/components/features/BadgeGrid";
import { CheckInHistory } from "@/components/features/CheckInHistory";
import { CartoonButton } from "@/components/ui/CartoonButton";

const MOCK_ADDRESS = "mock-user-address";

export default function CheckinPage() {
  const [stats, setStats] = useState<CheckInStats>({
    totalCheckins: 0,
    streak: 0,
    lastCheckinTime: null,
    canCheckIn: false,
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<{ date: string; checked: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadData = async () => {
    const s = await mockCheckInService.getStats(MOCK_ADDRESS);
    const b = await mockCheckInService.getBadges(MOCK_ADDRESS);
    const h = await mockCheckInService.getHistory(MOCK_ADDRESS);
    setStats(s);
    setBadges(b);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    if (!stats.canCheckIn) return;
    setCheckingIn(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      await mockCheckInService.checkIn(MOCK_ADDRESS);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "打卡失败");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-bounce text-4xl">🤔</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-20 bg-dots">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <CartoonButton variant="secondary" className="px-4 py-2 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> 返回
            </CartoonButton>
          </Link>
          <div className="bg-white px-4 py-2 rounded-xl border-3 border-brand-dark shadow-cartoon-sm font-bold text-sm">
            👤 {MOCK_ADDRESS.slice(0, 6)}...{MOCK_ADDRESS.slice(-4)}
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-6 w-full md:w-auto">
             <CheckInButton 
               onCheckIn={handleCheckIn} 
               canCheckIn={stats.canCheckIn}
               isCheckingIn={checkingIn}
             />
             <p className="text-gray-500 font-medium text-sm text-center">
               {stats.canCheckIn ? "今天还没有打卡哦！" : "今天已经完成任务啦，明天继续！"}
             </p>
          </div>
          
          <div className="flex flex-col gap-6 w-full md:w-2/3">
            <StatsDisplay total={stats.totalCheckins} streak={stats.streak} />
            <CheckInHistory history={history} />
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-2xl font-black text-brand-dark mb-6 flex items-center gap-2">
            <span>🏆</span> 成就徽章
          </h2>
          <BadgeGrid badges={badges} />
        </section>
      </div>
    </main>
  );
}
