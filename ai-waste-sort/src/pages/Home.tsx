import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, 
  Trophy, 
  TrendingUp, 
  Users, 
  Recycle,
  Lightbulb,
  Target,
  Flame,
  Zap,
  Award
} from "lucide-react";
import { getCurrentUser } from "@/services/auth";
import { getEducationalContent } from "@/services/education";
import { getPointsForLabel, useStats } from "@/lib/statsContext";
import StatTile from "@/components/StatTile";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

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
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-foreground shadow-xl border border-border/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Eco Champion'}!
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Track your waste sorting progress and keep earning points for every scan.
            </p>
          </div>
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Button 
            onClick={() => navigate('/scan')}
            className="w-full bg-gradient-primary hover:shadow-glow text-primary-foreground font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
            size="lg"
          >
            <Recycle className="w-5 h-5 mr-2" />
            Scan Waste Now
          </Button>
          <Button
            onClick={() => navigate('/community')}
            variant="outline"
            className="w-full border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-semibold shadow-md transition-all duration-200"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Explore Community
          </Button>
        </div>
      </div>

      {/* Professional Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <StatTile
          Icon={Target}
          label="Total Scans"
          value={userStats.totalScans}
          progress={(userStats.totalScans / 50) * 100}
          accentClass="from-primary to-accent"
        />

        <StatTile
          Icon={Trophy}
          label="Total Points"
          value={userStats.totalPoints}
          progress={(userStats.totalPoints / 500) * 100}
          accentClass="from-accent to-secondary"
        />

        <StatTile
          Icon={TrendingUp}
          label="Your Rank"
          value={`#${userStats.rank}`}
          progress={Math.max(10, 100 - (userStats.rank / 100) * 100)}
          accentClass="from-warning to-warning/80"
        />

        <StatTile
          Icon={Recycle}
          label="Items Sorted"
          value={userStats.itemsSorted}
          progress={(userStats.itemsSorted / 50) * 100}
          accentClass="from-emerald to-teal"
        />
      </div>

      {/* Environmental Impact Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-50/40 to-teal-50/40 border border-emerald-200/30 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald to-teal rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{impact.wasteRecycled}</p>
              <p className="text-xs text-emerald-600/70 font-medium">kg Waste Recycled</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50/40 to-cyan-50/40 border border-blue-200/30 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{impact.co2Saved}</p>
              <p className="text-xs text-blue-600/70 font-medium">kg CO₂ Saved</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50/40 to-lime-50/40 border border-green-200/30 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-lime-500 rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{impact.treesEquivalent}</p>
              <p className="text-xs text-green-600/70 font-medium">Trees Equivalent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Waste Breakdown Chart */}
      {wasteBreakdown.length > 0 && (
        <Card className="p-8 bg-gradient-card border border-border/50 shadow-xl">
          <h3 className="text-xl font-bold text-foreground mb-6">Waste Categories Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${(percentage).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {wasteBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} items`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {wasteBreakdown.map((item) => (
                <div key={item.category} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm text-foreground">{item.category}</p>
                      <p className="text-xs text-muted-foreground font-medium">{item.count} scans</p>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Scanning Trends Chart */}
      {dailyStats.length > 0 && (
        <Card className="p-8 bg-gradient-card border border-border/50 shadow-xl">
          <h3 className="text-xl font-bold text-foreground mb-6">Scanning Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} name="Scans" dot={{ fill: "#3b82f6", r: 5 }} />
              <Line type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} name="Points" dot={{ fill: "#10b981", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Achievement Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-gradient-to-br from-purple-50/40 to-pink-50/40 border border-purple-200/30 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-glow">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-600">Accuracy Score</h3>
              <p className="text-sm text-purple-600/70">Average confidence in scans</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold text-purple-600">{avgAccuracy}%</p>
              <div className="w-20 h-20 rounded-full border-4 border-purple-200 flex items-center justify-center bg-purple-50">
                <p className="text-center">
                  <span className="text-2xl font-bold text-purple-600">{avgAccuracy}</span>
                  <span className="text-xs text-purple-600/70 block">confident</span>
                </p>
              </div>
            </div>
            <div className="text-xs text-purple-600/70">Keep scanning to improve your accuracy!</div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-orange-50/40 to-red-50/40 border border-orange-200/30 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-glow">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-600">Best Day</h3>
              <p className="text-sm text-orange-600/70">Your peak scanning performance</p>
            </div>
          </div>
          {bestDay ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{bestDay.scans}</p>
                  <p className="text-xs text-orange-600/70">scans on {bestDay.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{bestDay.points}</p>
                  <p className="text-xs text-orange-600/70">points earned</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-orange-600/70">Start scanning to track your best day!</div>
          )}
        </Card>
      </div>
      <Card className="p-8 bg-gradient-card border border-border/50 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-glow">
            <Lightbulb className="w-7 h-7 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Smart Recycling Tips</h3>
            <p className="text-muted-foreground">Maximize your environmental impact</p>
          </div>
        </div>
        <div className="space-y-4">
          {recyclingTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-2 h-2 bg-gradient-primary rounded-full mt-2 flex-shrink-0 shadow-sm" />
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Community Impact Preview */}
      <Card className="p-8 bg-gradient-card border border-border/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Community Impact</h3>
              <p className="text-muted-foreground">Together we're making a difference</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
            <p className="text-2xl font-bold text-primary mb-1">1,234</p>
            <p className="text-xs text-muted-foreground font-medium">Active Users</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
            <p className="text-2xl font-bold text-accent mb-1">12.5K</p>
            <p className="text-xs text-muted-foreground font-medium">Total Scans</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
            <p className="text-2xl font-bold text-earth-brown mb-1">250K</p>
            <p className="text-xs text-muted-foreground font-medium">Total Points</p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/community')}
          className="w-full bg-gradient-primary hover:shadow-glow text-primary-foreground font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          View Leaderboard
        </Button>
      </Card>

      <Card className="p-8 bg-gradient-card border border-border/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
            <p className="text-muted-foreground">Latest scans from your account</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/history')} className="text-primary hover:text-primary/80">
            View all
          </Button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 p-8 text-center text-sm text-muted-foreground">
            Scan your first waste item to see activity here.
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((item) => (
              <div key={item._id} className="rounded-2xl border border-border/40 bg-secondary/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{getPointsForLabel(item.label)} pts</p>
                    <p className="text-xs text-muted-foreground">{Math.round(item.confidence * 100)}% confidence</p>
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
