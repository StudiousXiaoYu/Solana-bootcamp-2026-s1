export interface CheckInStats {
  totalCheckins: number;
  streak: number; // 连续打卡（可选）
  lastCheckinTime: number | null;
  canCheckIn: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // 可以是 emoji 或者本地图片路径
  threshold: number;
  unlocked: boolean;
  claimed: boolean;
}

const STORAGE_KEY_PREFIX = "checkin_dapp_";
const BADGE_THRESHOLDS = [
  { id: "badge_1", name: "初出茅庐", description: "累计打卡 7 天", threshold: 7, emoji: "🌱" },
  { id: "badge_2", name: "坚持不懈", description: "累计打卡 21 天", threshold: 21, emoji: "🔥" },
  { id: "badge_3", name: "打卡大师", description: "累计打卡 30 天", threshold: 30, emoji: "🏆" },
];

export class MockCheckInService {
  private getStorageKey(address: string) {
    return `${STORAGE_KEY_PREFIX}${address}`;
  }

  private getUserData(address: string): { total: number; lastTime: number; history: number[] } {
    if (typeof window === "undefined") return { total: 0, lastTime: 0, history: [] };
    
    const data = localStorage.getItem(this.getStorageKey(address));
    if (!data) return { total: 0, lastTime: 0, history: [] };
    return JSON.parse(data);
  }

  private saveUserData(address: string, data: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getStorageKey(address), JSON.stringify(data));
  }

  private isSameDay(timestamp1: number, timestamp2: number): boolean {
    if (!timestamp1 || !timestamp2) return false;
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    // 使用 UTC 天，避免时区问题导致的不同
    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    );
  }

  async getStats(address: string): Promise<CheckInStats> {
    const data = this.getUserData(address);
    const now = Date.now();
    const canCheckIn = !this.isSameDay(now, data.lastTime);

    // 简单计算 streak (这里简化处理，如果昨天打卡了 streak+1，否则重置)
    // 实际项目中需要遍历 history
    let streak = 0;
    // TODO: 实现 streak 计算逻辑

    return {
      totalCheckins: data.total,
      streak: 0, // 暂时 mock 0
      lastCheckinTime: data.lastTime > 0 ? data.lastTime : null,
      canCheckIn,
    };
  }

  async checkIn(address: string): Promise<boolean> {
    const data = this.getUserData(address);
    const now = Date.now();

    if (this.isSameDay(now, data.lastTime)) {
      throw new Error("今天已经打过卡啦！明天再来吧~");
    }

    data.total += 1;
    data.lastTime = now;
    data.history.push(now);
    
    this.saveUserData(address, data);
    return true;
  }

  async getHistory(address: string): Promise<{ date: string; checked: boolean }[]> {
    // 返回最近 7 天的状态
    const data = this.getUserData(address);
    const result: { date: string; checked: boolean }[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i); // 使用本地时间展示给用户看会更自然，或者统一 UTC
      // 这里为了展示简单，暂且混合使用（存储用 UTC 判断，展示用本地日期）
      // 实际生产建议统一。
      
      // 查找这一天是否有打卡记录
      // 为了准确，这里应该把 history 里的 timestamp 转成 UTC day string 对比
      // 简化版：
      const isChecked = data.history.some(ts => this.isSameDay(ts, d.getTime()));
      
      result.push({
        date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        checked: isChecked
      });
    }
    return result;
  }

  async getBadges(address: string): Promise<Badge[]> {
    const data = this.getUserData(address);
    
    return BADGE_THRESHOLDS.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      imageUrl: b.emoji,
      threshold: b.threshold,
      unlocked: data.total >= b.threshold,
      claimed: false, // Mock 阶段暂时都未领取
    }));
  }
}

export const mockCheckInService = new MockCheckInService();
