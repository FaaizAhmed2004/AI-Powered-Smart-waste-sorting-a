import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Trophy,
  TrendingUp,
  Users,
  Target,
  Medal,
  Crown
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  points: number;
  scans: number;
  isCurrentUser?: boolean;
}

interface TopItem {
  category: string;
  count: number;
  percentage: number;
}

const Community = () => {
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [createdCommunity, setCreatedCommunity] = useState<{ name: string; description: string } | null>(null);

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Sarah Johnson", initials: "SJ", points: 2450, scans: 156 },
    { rank: 2, name: "Michael Chen", initials: "MC", points: 2280, scans: 142 },
    { rank: 3, name: "Emma Williams", initials: "EW", points: 2150, scans: 138 },
    { rank: 4, name: "James Davis", initials: "JD", points: 1980, scans: 125 },
    { rank: 5, name: "Lisa Anderson", initials: "LA", points: 1850, scans: 118 },
    { rank: 15, name: "You", initials: "YO", points: 840, scans: 42, isCurrentUser: true },
  ];

  const topItems: TopItem[] = [
    { category: "Plastic Bottles", count: 3420, percentage: 28 },
    { category: "Glass Containers", count: 2840, percentage: 23 },
    { category: "Paper Products", count: 2350, percentage: 19 },
    { category: "Metal Cans", count: 1890, percentage: 15 },
    { category: "Electronic Waste", count: 1200, percentage: 10 },
  ];

  const communityStats = {
    totalUsers: 1234,
    totalScans: 12548,
    totalPoints: 250960,
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const handleCreateCommunity = () => {
    if (!communityName.trim()) {
      toast.error("Community name is required");
      return;
    }

    setCreatedCommunity({ name: communityName.trim(), description: communityDescription.trim() });
    toast.success("Community created successfully");
    setCommunityName("");
    setCommunityDescription("");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-eco text-primary-foreground border-0 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Community</h2>
        <p className="text-primary-foreground/90 mb-4">See how you rank against other eco-warriors</p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xl font-bold">{communityStats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-primary-foreground/80">Users</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xl font-bold">{communityStats.totalScans.toLocaleString()}</p>
            <p className="text-xs text-primary-foreground/80">Scans</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xl font-bold">{(communityStats.totalPoints / 1000).toFixed(1)}K</p>
            <p className="text-xs text-primary-foreground/80">Points</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 shadow-md">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Leaderboard</h3>
          </div>
          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Top Scans</p>
              <p className="text-2xl font-bold text-foreground">154</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Best Points</p>
              <p className="text-2xl font-bold text-foreground">2,450</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                entry.isCurrentUser
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <div className="flex items-center justify-center w-10 flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              <Avatar className={entry.isCurrentUser ? "border-2 border-primary" : ""}>
                <AvatarFallback className={entry.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {entry.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {entry.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.scans} scans
                </p>
              </div>

              <Badge
                variant={entry.isCurrentUser ? "default" : "secondary"}
                className="font-bold"
              >
                {entry.points} pts
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-2 shadow-md">
        <h3 className="text-lg font-bold text-foreground mb-4">Create a Community</h3>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Community Name</label>
              <Input
                value={communityName}
                onChange={(event) => setCommunityName(event.target.value)}
                placeholder="e.g. Green Guardians"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={communityDescription}
                onChange={(event) => setCommunityDescription(event.target.value)}
                placeholder="Share your community mission and goals"
              />
            </div>
            <Button onClick={handleCreateCommunity} className="w-full bg-primary text-primary-foreground">
              Create Community
            </Button>
          </div>

          <div className="rounded-3xl bg-secondary p-5 border border-border">
            <h4 className="text-lg font-semibold text-foreground mb-2">Why create a community?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bring users together around sustainable habits, share scan achievements, and motivate others with friendly competition.
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold">Track group progress</p>
                <p className="text-xs text-muted-foreground">Keep everyone motivated with shared points and achievements.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold">Share tips</p>
                <p className="text-xs text-muted-foreground">Encourage eco-friendly sorting habits inside your community.</p>
              </div>
            </div>
          </div>
        </div>

        {createdCommunity && (
          <div className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-200 p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-emerald-900">Community Created</h4>
            <p className="text-sm text-emerald-800 mt-2">{createdCommunity.name}</p>
            <p className="text-sm text-foreground/80 mt-1">{createdCommunity.description}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Community;
