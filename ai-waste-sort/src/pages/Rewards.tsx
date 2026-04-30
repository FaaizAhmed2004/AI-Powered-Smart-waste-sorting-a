import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Gift,
  Target,
  Star,
  Lock,
  CheckCircle2
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  reward: string;
  unlocked: boolean;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  available: boolean;
}

const Rewards = () => {
  const currentPoints = 840;

  // Mock data - will be replaced with backend data
  const milestones: Milestone[] = [
    {
      id: "1",
      title: "Getting Started",
      description: "Complete your first 10 scans",
      targetPoints: 100,
      reward: "Eco Beginner Badge",
      unlocked: true,
    },
    {
      id: "2",
      title: "Eco Enthusiast",
      description: "Reach 500 points",
      targetPoints: 500,
      reward: "Enthusiast Badge + 50 Bonus Points",
      unlocked: true,
    },
    {
      id: "3",
      title: "Green Champion",
      description: "Reach 1,000 points",
      targetPoints: 1000,
      reward: "Champion Badge + Tree Planting Certificate",
      unlocked: false,
    },
    {
      id: "4",
      title: "Sustainability Hero",
      description: "Reach 2,500 points",
      targetPoints: 2500,
      reward: "Hero Badge + Premium Features Unlock",
      unlocked: false,
    },
    {
      id: "5",
      title: "Earth Guardian",
      description: "Reach 5,000 points",
      targetPoints: 5000,
      reward: "Guardian Badge + Exclusive Merchandise",
      unlocked: false,
    },
  ];

  const rewards: Reward[] = [
    {
      id: "1",
      title: "Plant a Tree",
      description: "We'll plant a real tree in your name",
      pointsCost: 500,
      available: true,
    },
    {
      id: "2",
      title: "Eco Shopping Voucher",
      description: "$10 voucher for sustainable products",
      pointsCost: 800,
      available: true,
    },
    {
      id: "3",
      title: "Premium Features",
      description: "Unlock advanced analytics for 1 month",
      pointsCost: 1000,
      available: false,
    },
    {
      id: "4",
      title: "Reusable Bag Set",
      description: "Premium eco-friendly shopping bags",
      pointsCost: 1200,
      available: false,
    },
  ];

  const nextMilestone = milestones.find(m => !m.unlocked);
  const progress = nextMilestone 
    ? Math.min((currentPoints / nextMilestone.targetPoints) * 100, 100)
    : 100;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-eco text-primary-foreground border-0 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Rewards</h2>
        <p className="text-primary-foreground/90 mb-4">Earn points and unlock amazing rewards</p>
        
        <div className="bg-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-foreground/80">Your Points</span>
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{currentPoints}</p>
        </div>
      </Card>

      {nextMilestone && (
        <Card className="p-6 border-2 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Next Milestone</h3>
            <Badge variant="secondary">
              {currentPoints} / {nextMilestone.targetPoints}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{nextMilestone.title}</span>
              <span className="text-sm font-bold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="bg-secondary rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">{nextMilestone.description}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Gift className="w-4 h-4" />
              <span>{nextMilestone.reward}</span>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 border-2 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Milestones</h3>
        </div>

        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-start gap-4 p-4 rounded-xl ${
                milestone.unlocked
                  ? "bg-success/10 border-2 border-success/30"
                  : "bg-secondary"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                milestone.unlocked ? "bg-success" : "bg-muted"
              }`}>
                {milestone.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold mb-1 ${
                  milestone.unlocked ? "text-success" : "text-foreground"
                }`}>
                  {milestone.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {milestone.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={milestone.unlocked ? "default" : "secondary"} className="text-xs">
                    {milestone.targetPoints} points
                  </Badge>
                  {milestone.unlocked && (
                    <Badge variant="outline" className="text-xs border-success text-success">
                      Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-2 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Redeem Rewards</h3>
        </div>

        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className={`p-4 ${
              reward.available ? "border-2 hover:border-primary" : "opacity-60"
            }`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>
                {!reward.available && (
                  <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-bold">
                  <Star className="w-3 h-3 mr-1" />
                  {reward.pointsCost} points
                </Badge>
                <Button
                  size="sm"
                  disabled={!reward.available || currentPoints < reward.pointsCost}
                  className="bg-primary hover:bg-primary/90"
                >
                  {reward.available && currentPoints >= reward.pointsCost
                    ? "Redeem"
                    : "Not Enough Points"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Rewards;
