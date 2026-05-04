import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Leaf,
  Users,
  Lightbulb,
  Flame,
  Award
} from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { getEducationalContent } from "@/services/education";
import { getPointsForLabel, useStats } from "@/lib/statsContext";

const Home = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { totalPoints, totalScans, history, getWasteBreakdown, getDailyStats, getEnvironmentalImpact, getBestDay, getAverageAccuracy } = useStats();
  const recentHistory = history.slice(0, 4);
  const wasteBreakdown = getWasteBreakdown();
  const dailyStats = getDailyStats();
  const impact = getEnvironmentalImpact();
  const bestDay = getBestDay();
  const avgAccuracy = getAverageAccuracy();

  const userStats = {
    totalScans,
    totalPoints,
    rank: Math.max(1, 100 - Math.floor(totalPoints / 12)),
    itemsSorted: totalScans,
  };

  const [recyclingTips, setRecyclingTips] = useState<string[]>([
    "Clean containers before recycling to prevent contamination",
    "Remove caps from bottles before recycling",
    "Flatten cardboard boxes to save space",
    "Check local guidelines for what can be recycled",
  ]);

  // Load educational tips
  useEffect(() => {
    const loadTips = async () => {
      try {
        const tips = await getEducationalContent('recycling');
        if (tips.length > 0) {
          setRecyclingTips(tips.slice(0, 4).map(tip => tip.title));
        }
      } catch (error) {
        console.error("Failed to load recycling tips:", error);
        // Keep default tips if API fails
      }
    };

    loadTips();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-[2rem] border border-slate-200/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 shadow-2xl text-white">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your impact this week</p>
              <h1 className="text-3xl font-bold">{user?.name || 'Smart Waste Sorting & Recycling Assistant'}</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Scan waste items to earn points, reduce your carbon footprint, and improve recycling accuracy.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-4 text-right shadow-inner">
              <Leaf className="mx-auto h-10 w-10 text-emerald-300" />
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Total points</p>
              <p className="text-4xl font-bold text-white">{userStats.totalPoints}</p>
              <p className="text-xs text-slate-400">Earned so far</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[2rem] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scans</p>
              <p className="mt-3 text-3xl font-bold text-white">{userStats.totalScans}</p>
              <p className="text-xs text-slate-400">Items sorted</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Accuracy</p>
              <p className="mt-3 text-3xl font-bold text-white">{avgAccuracy}%</p>
              <p className="text-xs text-slate-400">Average confidence</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">CO₂ saved</p>
              <p className="mt-3 text-3xl font-bold text-emerald-300">{impact.co2Saved}kg</p>
              <p className="text-xs text-slate-400">Equivalent to {impact.treesEquivalent} trees</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => navigate('/scan')}
              className="w-full rounded-[2rem] bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-semibold shadow-xl shadow-emerald-500/20"
            >
              Scan waste now
            </Button>
            <Button
              onClick={() => navigate('/history')}
              variant="outline"
              className="w-full rounded-[2rem] border-slate-700 text-white font-semibold hover:bg-white/5"
            >
              View activity
            </Button>
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200/10 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Waste categories</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Most sorted</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-600">
              Weekly
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {wasteBreakdown.slice(0, 4).map((item) => (
              <div key={item.category} className="rounded-[2rem] border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.category}</p>
                    <p className="text-xs text-slate-500">{item.count} scans</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">+{item.points}</span>
                </div>
              </div>
            ))}
            {wasteBreakdown.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Scan items to build your category summary.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border border-slate-200/10 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Daily eco tips</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Recycle smarter</h2>
            </div>
            <Lightbulb className="h-8 w-8 text-amber-500" />
          </div>
          <div className="mt-6 space-y-4">
            {recyclingTips.slice(0, 4).map((tip, index) => (
              <div key={index} className="rounded-[2rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200/10 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Community</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Leaderboard</h2>
            </div>
            <Users className="h-8 w-8 text-slate-700" />
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-[2rem] bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Active users</p>
              <p className="mt-2 text-3xl">1,234</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Total scans</p>
              <p className="mt-2 text-3xl">12.5K</p>
            </div>
            <Button
              onClick={() => navigate('/community')}
              className="w-full rounded-[2rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
            >
              View leaderboard
            </Button>
          </div>
        </Card>
      </div>

      <Card className="rounded-[2rem] border border-slate-200/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent activity</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Latest scans</h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/history')} className="text-primary hover:text-primary/80">
            View all
          </Button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Scan your first waste item to see activity here.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {recentHistory.map((item) => (
              <div key={item._id} className="rounded-[2rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{getPointsForLabel(item.label)} pts</p>
                    <p className="text-xs text-slate-500">{Math.round(item.confidence * 100)}% confidence</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Home;
