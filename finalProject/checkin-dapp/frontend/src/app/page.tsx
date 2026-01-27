import Link from "next/link";
import { CartoonButton } from "@/components/ui/CartoonButton";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots pointer-events-none" />
      <div className="z-10 flex flex-col items-center gap-8 max-w-2xl text-center">
        <div className="text-6xl animate-bounce">📅</div>
        <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tight">
          链上打卡
          <span className="text-brand-pink block md:inline md:ml-4">成就徽章</span>
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          每天一次，坚持不懈。在 Solana 链上记录你的每一个足迹，赢取专属 NFT 徽章！
        </p>
        
        <div className="flex gap-4">
          <Link href="/checkin">
            <CartoonButton className="text-xl px-8 py-4">开始打卡 🚀</CartoonButton>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 opacity-50">
           <div className="text-4xl">🌱</div>
           <div className="text-4xl">🔥</div>
           <div className="text-4xl">🏆</div>
        </div>
      </div>
    </main>
  );
}
