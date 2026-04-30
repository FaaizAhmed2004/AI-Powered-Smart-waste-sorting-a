import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatTileProps {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  progress: number;
  accentClass?: string;
}

const StatTile = ({ Icon, label, value, progress, accentClass = "from-primary to-accent" }: StatTileProps) => {
  return (
    <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${accentClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
      <div className="w-full bg-secondary/50 rounded-full h-2">
        <div className="h-2 rounded-full bg-gradient-to-r from-white/90 to-white/30" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </Card>
  );
};

export default StatTile;
