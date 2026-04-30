import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2, Wine, FileText, Cpu, Leaf, Coins,
  Calendar, Loader2, AlertCircle,
} from "lucide-react";
import { deleteClassification } from "@/services/classification";
import { isAuthenticated } from "@/services/auth";
import { useStats } from "@/lib/statsContext";
import { toast } from "sonner";

type WasteType =
  | "Plastic"
  | "Glass"
  | "Paper"
  | "Metal"
  | "Organic"
  | "Electronic"
  | "Other";

const wasteCategories: Record<
  WasteType,
  { icon: any; color: string; bgColor: string }
> = {
  Plastic: { icon: Trash2, color: "text-blue-600", bgColor: "bg-blue-50" },
  Glass: { icon: Wine, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  Paper: { icon: FileText, color: "text-amber-600", bgColor: "bg-amber-50" },
  Metal: { icon: Coins, color: "text-slate-600", bgColor: "bg-slate-50" },
  Organic: { icon: Leaf, color: "text-green-600", bgColor: "bg-green-50" },
  Electronic: { icon: Cpu, color: "text-purple-600", bgColor: "bg-purple-50" },
  Other: { icon: AlertCircle, color: "text-gray-600", bgColor: "bg-gray-50" },
};

const History = () => {
  const { history, totalPoints, refresh } = useStats();
  const [isLoading, setIsLoading] = useState(history.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setError("Please log in to view your scan history");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, []);

  const handleDeleteScan = async (id: string) => {
    try {
      await deleteClassification(id);
      await refresh();
      toast.success("Scan deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete scan", { description: err.message });
    }
  };

  const scanHistory = history.filter((r) => !r._id.startsWith("optimistic-"));

  const mapLabelToWasteType = (label: string): WasteType => {
    const l = label.toLowerCase();
    if (l.includes("plastic")) return "Plastic";
    if (l.includes("glass")) return "Glass";
    if (l.includes("paper") || l.includes("cardboard")) return "Paper";
    if (l.includes("metal")) return "Metal";
    return "Other";
  };

  const getPoints = (type: WasteType) =>
    ({
      Plastic: 10,
      Glass: 15,
      Paper: 8,
      Metal: 20,
      Organic: 5,
      Electronic: 25,
      Other: 0,
    }[type]);

  const totalPoints_local = scanHistory.reduce((sum, scan) => {
    return sum + getPoints(mapLabelToWasteType(scan.label));
  }, 0);
  void totalPoints_local; // use context totalPoints instead

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
        Loading history...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
        {error}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-eco text-primary-foreground">
        <h2 className="text-2xl font-bold">Scan History</h2>
        <div className="flex justify-between mt-4">
          <div>
            <p>Total Scans</p>
            <p className="text-2xl font-bold">{scanHistory.length}</p>
          </div>
          <div>
            <p>Points Earned</p>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </Card>

      {scanHistory.map((scan) => {
        const type = mapLabelToWasteType(scan.label);
        const category = wasteCategories[type];
        const Icon = category.icon;

        return (
          <Card key={scan._id} className="p-4 flex gap-4">
            <div
              className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 ${category.color}`} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">{type}</h3>
              <Badge className="mt-1">+{getPoints(type)} pts</Badge>
              <div className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(scan.createdAt).toLocaleString()}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => handleDeleteScan(scan._id)}
              className="text-red-600"
            >
              Delete
            </Button>
          </Card>
        );
      })}

      {scanHistory.length === 0 && (
        <Card className="p-12 text-center">No scans yet</Card>
      )}
    </div>
  );
};

export default History;
