"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { mockCheckInService, CheckInStats, Badge, type CheckInService } from "@/lib/mock/checkin-service";
import { createAnchorCheckInService } from "@/lib/solana/anchor-checkin-service";
import { getSolanaFrontendConfig } from "@/lib/solana/env";
import { CheckInButton } from "@/components/features/CheckInButton";
import { StatsDisplay } from "@/components/features/StatsDisplay";
import { BadgeGrid } from "@/components/features/BadgeGrid";
import { CheckInHistory } from "@/components/features/CheckInHistory";
import { CartoonButton } from "@/components/ui/CartoonButton";

export default function CheckinPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const address = publicKey?.toBase58() ?? null;

  const solanaConfig = useMemo(() => getSolanaFrontendConfig(), []);

  const checkInService: CheckInService = useMemo(() => {
    if (anchorWallet && solanaConfig.programId) {
      return createAnchorCheckInService({
        connection,
        wallet: anchorWallet,
        programId: solanaConfig.programId,
      });
    }
    return mockCheckInService;
  }, [anchorWallet, connection, solanaConfig.programId]);

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

  const resetData = () => {
    setStats({
      totalCheckins: 0,
      streak: 0,
      lastCheckinTime: null,
      canCheckIn: false,
    });
    setBadges([]);
    setHistory([]);
  };

  const loadData = async (userAddress: string) => {
    const s = await checkInService.getStats(userAddress);
    const b = await checkInService.getBadges(userAddress);
    const h = await checkInService.getHistory(userAddress);
    setStats(s);
    setBadges(b);
    setHistory(h);
  };

  useEffect(() => {
    if (!address) {
      resetData();
      setLoading(false);
      return;
    }

    setLoading(true);
    loadData(address)
      .catch(error => {
        alert(error instanceof Error ? error.message : "加载数据失败");
      })
      .finally(() => setLoading(false));
  }, [address, checkInService]);

  const handleCheckIn = async () => {
    if (!address) return;
    if (!stats.canCheckIn) return;
    setCheckingIn(true);
    try {
      if (checkInService === mockCheckInService) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      await checkInService.checkIn(address);
      await loadData(address);
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
    <main className="min-h-screen p-6 pb-20 relative">
      <div className="absolute inset-0 bg-dots pointer-events-none -z-10" />
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <CartoonButton variant="secondary" className="px-4 py-2 text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> 返回
            </CartoonButton>
          </Link>
          <WalletMultiButton className="!bg-white !text-brand-dark !border-3 !border-brand-dark !rounded-xl !shadow-cartoon-sm !font-bold !text-sm" />
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-6 w-full md:w-auto">
             <CheckInButton 
               onCheckIn={handleCheckIn} 
               canCheckIn={!!address && stats.canCheckIn}
               isCheckingIn={checkingIn}
             />
             <p className="text-gray-500 font-medium text-sm text-center">
               {!address
                 ? "请先连接钱包再开始打卡～"
                 : stats.canCheckIn
                   ? "今天还没有打卡哦！"
                   : "今天已经完成任务啦，明天继续！"}
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
