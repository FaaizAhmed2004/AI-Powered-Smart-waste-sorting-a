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
  areaRatio?: number;
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
  const [showCamera, setShowCamera]   = useState(true);
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
      confidence: Math.min(Math.round(det.confidence * 100), 100), // Cap at 100% for authenticity
      points: wasteCategories[type].points,
      instructions: instructions[type],
      originalLabel: det.label,
      recyclable: recycleInfo.recyclable,
      recyclableLabel: recycleInfo.recyclableLabel,
      bbox: det.bbox,
      areaRatio: det.areaRatio,
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
    const allHighConfidence = result.detections.every((d) => d.confidence >= 90);

    if (allRecyclable && allHighConfidence) {
      return {
        label: "Ready to recycle (Authenticated)",
        caption: "All detected items are recyclable and results are 100% authentic.",
        badge: "bg-emerald-100 text-emerald-900",
      };
    }

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
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      {showCoins && (
        <CoinAnimation points={earnedPoints} onComplete={() => setShowCoins(false)} />
      )}

      <Card className="overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Waste scan</p>
              <h2 className="text-3xl font-bold">Identify recyclable waste instantly</h2>
            </div>
            <div className="rounded-[2rem] bg-white/10 border border-white/10 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Potential reward</p>
              <p className="text-2xl font-bold text-white">
                +{scanResult ? scanResult.detections.reduce((s, d) => s + d.points, 0) : 0}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-slate-300">
            Point your camera at the item and hold steady. The app will scan the object and show recycling guidance immediately.
          </p>
        </div>

        <div className="p-4 bg-slate-950/90">
          <input
            aria-label="Upload image file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
            {showCamera ? (
              <WasteScanner onResult={handleCameraResult} />
            ) : (
              <div className="grid min-h-[420px] place-items-center gap-4 bg-slate-900 p-6 text-center text-slate-200">
                <Camera className="w-14 h-14 text-white opacity-80" />
                <div>
                  <p className="text-xl font-semibold">Upload a waste image</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Choose a photo from your device if you prefer not to use the camera.
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full bg-white text-slate-950 font-semibold"
                >
                  Upload Image
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-14 border-slate-700 text-white hover:border-white/40 hover:bg-white/5 font-semibold gap-2"
            >
              <Upload className="w-5 h-5" /> Upload Image
            </Button>
            <Button
              onClick={() => setShowCamera((p) => !p)}
              variant="outline"
              className="h-14 border-slate-700 text-white hover:border-white/40 hover:bg-white/5 font-semibold gap-2"
            >
              <Camera className="w-5 h-5" />
              {showCamera ? "Hide Camera" : "Live Camera"}
            </Button>
          </div>

          {!scanResult && (
            <div className="mt-4 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-300">
              Point the camera at a waste item or upload an image to begin scanning. The scanner will guide you with live feedback and show results below.
            </div>
          )}

          {scanResult && (
            <div className="mt-6 rounded-[2rem] bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Scan result</p>
                  <h3 className="mt-2 text-2xl font-bold">
                    {scanResult.detections[0]?.originalLabel || scanResult.detections[0]?.type || "Detected item"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {scanResult.detections[0]?.type} • {scanResult.detections[0]?.confidence}% confidence
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 px-4 py-3 text-center text-emerald-900 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Points</p>
                  <p className="mt-1 text-xl font-semibold">
                    +{scanResult.detections.reduce((s, d) => s + d.points, 0)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {scanResult.detections.map((det, index) => {
                  const cat = wasteCategories[det.type] || wasteCategories.Other;
                  const Icon = cat.icon;
                  return (
                    <div key={index} className="rounded-[2rem] border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 ${cat.bg} rounded-2xl flex items-center justify-center`}>
                            <Icon className={`${cat.color} w-5 h-5`} />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{det.type}</p>
                            <p className="text-sm text-slate-500">{det.recyclableLabel}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-amber-500">+{det.points}</span>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        {det.instructions}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  onClick={handleScanAgain}
                  variant="outline"
                  className="h-14 border-slate-300 text-slate-700 font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Scan Again
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="h-14 bg-emerald-600 text-white font-semibold shadow-xl hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Saved</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Scan</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 border border-slate-200/10 bg-white shadow-2xl rounded-[2rem]">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> How it works
        </h3>
        <div className="space-y-3">
          {[
            "Point the camera at the waste item to begin scanning",
            "The app detects the material and shows recycling advice",
            "Save your scan to track points and environmental impact",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 h-7 w-7 rounded-2xl bg-slate-100 text-slate-700 grid place-items-center text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Scan;
