import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera, Upload, Loader2, Trash2, Wine, FileText, Cpu,
  Leaf as LeafIcon, Coins, AlertCircle, CheckCircle2,
  ScanLine, Sparkles, RotateCcw, Save,
} from "lucide-react";
import { toast } from "sonner";
import { classifyImage, classifyAndSaveImage, DetectionResult } from "../services/classification";
import { getCurrentUser, isAuthenticated } from "../services/auth";
import WasteScanner from "../components/wasteScanner";
import CoinAnimation from "../components/CoinAnimation";
import { useStats } from "@/lib/statsContext";
import { LucideIcon } from "lucide-react";

type WasteType = "Plastic" | "Glass" | "Paper" | "Metal" | "Organic" | "Electronic" | "Other";

interface Detection {
  type: WasteType;
  confidence: number;
  points: number;
  instructions: string;
  originalLabel: string;
  recyclable: boolean;
  recyclableLabel: string;
  bbox: [number, number, number, number];
}

interface ScanResult {
  detections: Detection[];
  count: number;
  imageFile?: File;
  imagePreview?: string;
}

const recyclableTypes: WasteType[] = ["Plastic", "Glass", "Paper", "Metal"];

const isRecyclableType = (type: WasteType) => recyclableTypes.includes(type);

const getRecyclableStatus = (type: WasteType) => {
  const recyclable = isRecyclableType(type);
  return {
    recyclable,
    recyclableLabel: recyclable ? "Ready to recycle" : "Not ready to recycle",
    statusDescription: recyclable
      ? "This item can go in regular recycling with the right preparation."
      : "This item needs special disposal or cannot be recycled in the normal stream.",
  };
};

const wasteCategories: Record<string, { icon: LucideIcon; color: string; bg: string; points: number }> = {
  Plastic:    { icon: Trash2,       color: "text-sky-600",    bg: "bg-sky-100",    points: 10 },
  Glass:      { icon: Wine,         color: "text-purple-600", bg: "bg-purple-100", points: 15 },
  Paper:      { icon: FileText,     color: "text-amber-600",  bg: "bg-amber-100",  points: 8  },
  Metal:      { icon: Coins,        color: "text-orange-600", bg: "bg-orange-100", points: 20 },
  Organic:    { icon: LeafIcon,     color: "text-green-600",  bg: "bg-green-100",  points: 5  },
  Electronic: { icon: Cpu,          color: "text-blue-600",   bg: "bg-blue-100",   points: 25 },
  Other:      { icon: AlertCircle,  color: "text-gray-500",   bg: "bg-gray-100",   points: 0  },
};

const mapLabel = (label: string): WasteType => {
  const n = label.toLowerCase().trim();
  if (n.includes("plastic"))                          return "Plastic";
  if (n.includes("glass"))                            return "Glass";
  if (n.includes("paper") || n.includes("cardboard")) return "Paper";
  if (n.includes("metal"))                            return "Metal";
  if (n.includes("organic") || n.includes("food"))   return "Organic";
  if (n.includes("electronic") || n.includes("e-waste")) return "Electronic";
  return "Other";
};

const instructions: Record<WasteType, string> = {
  Plastic:    "Clean and dry the item. Remove labels if possible. Place in the plastic recycling bin.",
  Glass:      "Rinse the container. Remove metal caps or lids. Place in the glass recycling bin.",
  Paper:      "Keep dry and clean. Flatten boxes to save space. Place in the paper recycling bin.",
  Metal:      "Rinse containers. Crush cans to save space. Place in the metal recycling bin.",
  Organic:    "Compost organic waste if possible. Keep separate from other waste types.",
  Electronic: "Take to a designated e-waste collection center. Do not dispose in regular trash.",
  Other:      "Check local guidelines for proper disposal of this item.",
};

const Scan = () => {
  const { addOptimistic, refresh } = useStats();
  const [isScanning, setIsScanning]   = useState(false);
  const [scanResult, setScanResult]   = useState<ScanResult | null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [saved, setSaved]             = useState(false);
  const [showCamera, setShowCamera]   = useState(false);
  const [showCoins, setShowCoins]     = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();

  const triggerCoinAnimation = (total: number) => {
    setEarnedPoints(total);
    setShowCoins(false);
    window.requestAnimationFrame(() => setShowCoins(true));
  };

  const mapDetection = (det: DetectionResult): Detection => {
    const type = mapLabel(det.label);
    const recycleInfo = getRecyclableStatus(type);
    return {
      type,
      confidence: Math.round(det.confidence * 100),
      points: wasteCategories[type].points,
      instructions: instructions[type],
      originalLabel: det.label,
      recyclable: recycleInfo.recyclable,
      recyclableLabel: recycleInfo.recyclableLabel,
      bbox: det.bbox,
    };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);
    setSaved(false);
    const preview = URL.createObjectURL(file);

    try {
      const data = await classifyImage(file);
      const detections: Detection[] = data.detections.map(mapDetection);

      const total = detections.reduce((s, d) => s + d.points, 0);
      setScanResult({ detections, count: data.count, imageFile: file, imagePreview: preview });

      triggerCoinAnimation(total);

      toast.success(`${data.count} item${data.count > 1 ? "s" : ""} identified!`, {
        description: `+${total} pts — hit Save to record it`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Scan failed", { description: "Could not identify the image. Please try again." });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCameraResult = (data: ClassificationResult) => {
    const detections: Detection[] = data.detections.map(mapDetection);
    const total = detections.reduce((s, d) => s + d.points, 0);

    setScanResult({ detections, count: data.count });
    setSaved(false);
    triggerCoinAnimation(total);

    toast.success(`${data.count} item${data.count > 1 ? "s" : ""} identified!`, {
      description: `+${total} pts — hit Save to record it`,
    });
  };

  const handleSave = async () => {
    if (!scanResult) return;
    if (!isAuthenticated() || !user) {
      toast.error("Please log in to save your scan");
      return;
    }

    setIsSaving(true);

    // Optimistically update stats in real-time
    scanResult.detections.forEach((d) => addOptimistic(d.originalLabel, d.confidence / 100));

    try {
      await Promise.all(
        scanResult.detections.map((det) =>
          classifyAndSaveImage(
            `classification_${Date.now()}_${det.originalLabel}_${scanResult.imageFile?.name || "image"}`,
            det.originalLabel,
            det.confidence / 100
          )
        )
      );

      // Sync real data from server
      await refresh();

      setSaved(true);
      const total = scanResult.detections.reduce((s, d) => s + d.points, 0);
      toast.success("Saved to your dashboard!", {
        description: `+${total} pts added to your account`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Save failed", { description: "Could not save to server. Try again." });
      // Refresh to revert optimistic update
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setSaved(false);
    setShowCoins(false);
  };

  const getOverallStatus = (result: ScanResult) => {
    const allRecyclable = result.detections.every((d) => d.recyclable);
    const someRecyclable = result.detections.some((d) => d.recyclable);

    if (allRecyclable) {
      return {
        label: "Ready to recycle",
        caption: "All detected items are recyclable in the normal stream.",
        badge: "bg-emerald-100 text-emerald-900",
      };
    }

    if (someRecyclable) {
      return {
        label: "Partially recyclable",
        caption: "Some items can be recycled, while others require special disposal.",
        badge: "bg-amber-100 text-amber-900",
      };
    }

    return {
      label: "Not ready to recycle",
      caption: "No detected items are suitable for regular recycling.",
      badge: "bg-red-100 text-red-900",
    };
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {showCoins && (
        <CoinAnimation points={earnedPoints} onComplete={() => setShowCoins(false)} />
      )}

      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ScanLine className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Scan Waste Item</h2>
          </div>
          <p className="text-white/80 text-sm">
            AI-powered identification — earn points for every scan
          </p>
        </div>

        <div className="p-6">
          <input
            aria-label="Upload image file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* ── Idle ── */}
          {!isScanning && !scanResult && (
            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 hover:border-primary/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Take Photo or Upload</p>
                  <p className="text-sm text-muted-foreground">Tap to open camera or choose a file</p>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-14 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 font-semibold gap-2"
                >
                  <Upload className="w-5 h-5" /> Upload Image
                </Button>
                <Button
                  onClick={() => setShowCamera((p) => !p)}
                  variant="outline"
                  className="h-14 border-2 border-accent/30 hover:border-accent hover:bg-accent/5 font-semibold gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {showCamera ? "Hide Camera" : "Live Camera"}
                </Button>
              </div>

              {showCamera && (
                <div className="mt-4 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                  <WasteScanner onResult={handleCameraResult} />
                </div>
              )}

              {/* Points guide */}
              <div className="mt-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">Points per category</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(wasteCategories).filter(([k]) => k !== "Other").map(([type, cat]) => {
                    const Icon = cat.icon;
                    return (
                      <div key={type} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${cat.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span className="text-xs font-medium text-gray-700">{type}</span>
                        <span className={`text-xs font-bold ml-auto ${cat.color}`}>+{cat.points}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Scanning ── */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">Analyzing waste...</p>
                <p className="text-sm text-muted-foreground mt-1">AI is identifying the item</p>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {scanResult && (
            <div className="space-y-5">
              {/* Summary row */}
              <div className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                {scanResult.imagePreview && (
                  <img
                    src={scanResult.imagePreview}
                    alt="Scanned item"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-primary/20 flex-shrink-0"
                  />
                )}
                <div className="flex flex-col justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-foreground">
                      {scanResult.count} item{scanResult.count > 1 ? "s" : ""} identified
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="text-2xl font-black text-amber-500">
                      +{scanResult.detections.reduce((s, d) => s + d.points, 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                  {saved && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to dashboard
                    </span>
                  )}
                </div>
              </div>

              {/* Recyclability banner */}
              <div className="rounded-2xl border border-border/20 bg-slate-50 p-4">
                {(() => {
                  const status = getOverallStatus(scanResult);
                  return (
                    <div className={`rounded-2xl p-4 ${status.badge} border ${status.badge.replace("text-", "border-")}/20`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold uppercase tracking-[0.24em]">{status.label}</span>
                        <span className="text-xs text-muted-foreground">{status.caption}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Detection cards */}
              <div className="space-y-3">
                {scanResult.detections.map((det, i) => {
                  const cat = wasteCategories[det.type] || wasteCategories.Other;
                  const Icon = cat.icon;
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-colors bg-card">
                      <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${cat.color}`}>{det.type}</span>
                            <Badge variant="secondary" className="text-xs">
                              {det.confidence}% confident
                            </Badge>
                          </div>
                          <span className="font-black text-amber-500 text-lg">+{det.points}</span>
                        </div>
                        <div className="mb-2">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${det.recyclable ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                            {det.recyclableLabel}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 mb-2">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${det.confidence}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{det.instructions}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  onClick={handleScanAgain}
                  variant="outline"
                  className="h-12 border-2 gap-2 font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Scan Again
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="h-12 font-bold shadow-lg gap-2 border-0 text-white"
                  style={{
                    background: saved
                      ? "linear-gradient(135deg,#22c55e,#16a34a)"
                      : "linear-gradient(135deg,#f59e0b,#d97706)",
                  }}
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save to Dashboard</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-6 border border-border/50 shadow-md">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> How it works
        </h3>
        <div className="space-y-3">
          {[
            "Scan or upload an image of your waste item",
            "AI identifies the category — coins pop up instantly",
            "Hit Save to record it on your dashboard",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Scan;
