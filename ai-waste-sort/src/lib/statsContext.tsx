import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getUserClassifications, ClassificationRecord } from "@/services/classification";
import { getCurrentUser, isAuthenticated } from "@/services/auth";

const getPointsForLabel = (label: string): number => {
  const t = label.toLowerCase();
  if (t.includes("plastic")) return 10;
  if (t.includes("glass")) return 15;
  if (t.includes("paper") || t.includes("cardboard")) return 8;
  if (t.includes("metal")) return 20;
  if (t.includes("organic")) return 5;
  if (t.includes("electronic")) return 25;
  return 0;
};

interface WasteBreakdown {
  category: string;
  count: number;
  points: number;
  percentage: number;
  color: string;
}

interface DailyStats {
  date: string;
  scans: number;
  points: number;
}

interface StatsContextValue {
  totalPoints: number;
  totalScans: number;
  history: ClassificationRecord[];
  refresh: () => Promise<void>;
  addOptimistic: (label: string, confidence: number) => void;
  getWasteBreakdown: () => WasteBreakdown[];
  getDailyStats: () => DailyStats[];
  getEnvironmentalImpact: () => { co2Saved: number; wasteRecycled: number; treesEquivalent: number };
  getBestDay: () => DailyStats | null;
  getAverageAccuracy: () => number;
}

const StatsContext = createContext<StatsContextValue>({
  totalPoints: 0,
  totalScans: 0,
  history: [],
  refresh: async () => {},
  addOptimistic: () => {},
  getWasteBreakdown: () => [],
  getDailyStats: () => [],
  getEnvironmentalImpact: () => ({ co2Saved: 0, wasteRecycled: 0, treesEquivalent: 0 }),
  getBestDay: () => null,
  getAverageAccuracy: () => 0,
});

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<ClassificationRecord[]>([]);

  const refresh = useCallback(async () => {
    const user = getCurrentUser();
    if (!isAuthenticated() || !user) return;
    try {
      const data = await getUserClassifications(user._id);
      setHistory(data);
    } catch {
      // silently fail
    }
  }, []);

  // Optimistically add a record before backend confirms
  const addOptimistic = useCallback((label: string, confidence: number) => {
    const user = getCurrentUser();
    const fake: ClassificationRecord = {
      _id: `optimistic-${Date.now()}`,
      userId: user?._id ?? "",
      imageUrl: "",
      label,
      confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHistory((prev) => [fake, ...prev]);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const totalPoints = history.reduce((s, r) => s + getPointsForLabel(r.label), 0);
  const totalScans = history.length;

  const getWasteBreakdown = useCallback((): WasteBreakdown[] => {
    const categoryMap = new Map<string, { count: number; points: number }>();
    const colors: Record<string, string> = {
      plastic: "#3b82f6",
      glass: "#06b6d4",
      paper: "#f59e0b",
      cardboard: "#d97706",
      metal: "#6b7280",
      organic: "#10b981",
      electronic: "#8b5cf6",
      trash: "#ef4444",
    };

    history.forEach((item) => {
      const label = item.label.toLowerCase();
      const key = Object.keys(colors).find((k) => label.includes(k)) || label;
      const current = categoryMap.get(key) || { count: 0, points: 0 };
      categoryMap.set(key, {
        count: current.count + 1,
        points: current.points + getPointsForLabel(item.label),
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count: data.count,
        points: data.points,
        percentage: totalScans > 0 ? (data.count / totalScans) * 100 : 0,
        color: colors[category.toLowerCase()] || "#6b7280",
      }))
      .sort((a, b) => b.count - a.count);
  }, [history, totalScans]);

  const getDailyStats = useCallback((): DailyStats[] => {
    const dailyMap = new Map<string, { scans: number; points: number }>();

    history.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const current = dailyMap.get(date) || { scans: 0, points: 0 };
      dailyMap.set(date, {
        scans: current.scans + 1,
        points: current.points + getPointsForLabel(item.label),
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [history]);

  const getEnvironmentalImpact = useCallback(() => {
    // Estimates based on waste categories
    const breakdown = getWasteBreakdown();
    let co2Saved = 0;
    let wasteRecycled = 0;

    breakdown.forEach((item) => {
      const category = item.category.toLowerCase();
      // kg of CO2 saved per item
      if (category.includes("plastic")) {
        co2Saved += item.count * 0.2;
        wasteRecycled += item.count * 0.025; // kg
      } else if (category.includes("glass")) {
        co2Saved += item.count * 0.15;
        wasteRecycled += item.count * 0.4; // kg
      } else if (category.includes("paper") || category.includes("cardboard")) {
        co2Saved += item.count * 0.1;
        wasteRecycled += item.count * 0.08; // kg
      } else if (category.includes("metal")) {
        co2Saved += item.count * 0.25;
        wasteRecycled += item.count * 0.3; // kg
      } else if (category.includes("organic")) {
        co2Saved += item.count * 0.05;
        wasteRecycled += item.count * 0.05; // kg
      }
    });

    return {
      co2Saved: Math.round(co2Saved * 10) / 10,
      wasteRecycled: Math.round(wasteRecycled * 10) / 10,
      treesEquivalent: Math.round((co2Saved / 21) * 10) / 10, // 1 tree absorbs ~21kg CO2/year
    };
  }, [getWasteBreakdown]);

  const getBestDay = useCallback((): DailyStats | null => {
    const daily = getDailyStats();
    return daily.length > 0 ? daily.reduce((best, curr) => (curr.points > best.points ? curr : best)) : null;
  }, [getDailyStats]);

  const getAverageAccuracy = useCallback((): number => {
    if (history.length === 0) return 0;
    const avgConfidence = history.reduce((sum, item) => sum + item.confidence, 0) / history.length;
    return Math.round(avgConfidence * 100);
  }, [history]);

  return (
    <StatsContext.Provider
      value={{
        totalPoints,
        totalScans,
        history,
        refresh,
        addOptimistic,
        getWasteBreakdown,
        getDailyStats,
        getEnvironmentalImpact,
        getBestDay,
        getAverageAccuracy,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => useContext(StatsContext);
export { getPointsForLabel };
