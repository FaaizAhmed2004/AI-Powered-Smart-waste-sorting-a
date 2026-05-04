import React, { useRef, useState, useEffect } from "react";
import { classifyImage, ClassificationResult, DetectionResult } from "../services/classification";

interface WasteScannerProps {
  onResult?: (result: ClassificationResult) => void;
}

const MIN_AREA_RATIO = 0.15;

const WasteScanner: React.FC<WasteScannerProps> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [scanResult, setScanResult] = useState<ClassificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Position waste item in the center and hold steady.");
  const [videoReady, setVideoReady] = useState(false);
  const [isReadyToPredict, setIsReadyToPredict] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanDirection, setScanDirection] = useState<'center' | 'left' | 'right' | 'up' | 'down'>('center');
  const lastSentResultRef = useRef<string>("");
  const intervalRef = useRef<number | null>(null);
  const scanStartTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      const video = videoRef.current;
      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        if (video.srcObject instanceof MediaStream) {
          video.srcObject.getTracks().forEach((track) => track.stop());
        }
      }

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!videoReady) return;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      if (!isScanning) {
        captureAndScan();
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [videoReady, isScanning]);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${scanProgress}%`;
    }
  }, [scanProgress]);

  const handleLoadedMetadata = () => {
    setVideoReady(true);
  };

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream: MediaStream) => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.addEventListener("loadedmetadata", handleLoadedMetadata);
        }
      })
      .catch((err) => {
        console.error("Camera error: ", err);
        setCameraError("Unable to access camera. Please allow camera permissions.");
      });
  };

  const drawBoundingBoxes = (detections: DetectionResult[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw target zone overlay
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const targetSize = Math.min(canvas.width, canvas.height) * 0.6; // 60% of smaller dimension
    const targetX = centerX - targetSize / 2;
    const targetY = centerY - targetSize / 2;

    // Draw scanning animation
    if (progressIntervalRef.current && !scanComplete) {
      // Draw scanning lines
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      const scanLineY = targetY + (targetSize * (scanProgress / 100));
      ctx.beginPath();
      ctx.moveTo(targetX, scanLineY);
      ctx.lineTo(targetX + targetSize, scanLineY);
      ctx.stroke();

      // Draw direction indicator
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";

      let directionText = "";
      switch (scanDirection) {
        case 'center': directionText = "○ Center"; break;
        case 'left': directionText = "← Left"; break;
        case 'right': directionText = "→ Right"; break;
        case 'up': directionText = "↑ Up"; break;
        case 'down': directionText = "↓ Down"; break;
      }

      ctx.fillText(directionText, centerX, targetY - 30);
    }

    // Draw target zone
    ctx.strokeStyle = scanComplete ? "#00ff00" : "#ffffff";
    ctx.lineWidth = scanComplete ? 4 : 3;
    ctx.setLineDash(scanComplete ? [] : [10, 5]);
    ctx.strokeRect(targetX, targetY, targetSize, targetSize);
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    const instructionText = scanComplete ? "Scan Complete!" : "Position waste here";
    ctx.fillText(instructionText, centerX, targetY - 10);

    // Draw bounding boxes
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#22c55e";
    ctx.fillStyle = "#22c55e";
    ctx.font = "16px Arial";
    ctx.textBaseline = "top";

    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const areaLabel = detection.areaRatio ? `(${Math.round(detection.areaRatio * 100)}% frame)` : "";
      const labelText = `${detection.label} ${Math.round(detection.confidence * 100)}% ${areaLabel}`;
      ctx.fillText(labelText, Math.max(x1 + 6, 4), Math.max(y1 + 4, 4));
    });
  };

  const formatResultKey = (data: ClassificationResult) => {
    return data.detections
      .map((d) => `${d.label}:${d.confidence.toFixed(2)}:${(d.areaRatio ?? 0).toFixed(3)}`)
      .join("|");
  };

  const SCAN_DIRECTIONS = ['center', 'left', 'right', 'up', 'down'] as const;
  const SCAN_DURATION = 3000; // 3 seconds per direction
  const TOTAL_SCAN_TIME = SCAN_DIRECTIONS.length * SCAN_DURATION;

  const startFingerprintScan = () => {
    setScanProgress(0);
    setScanComplete(false);
    setScanDirection('center');
    scanStartTimeRef.current = Date.now();

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - scanStartTimeRef.current;
      const progress = Math.min((elapsed / TOTAL_SCAN_TIME) * 100, 100);
      setScanProgress(progress);

      // Change direction every SCAN_DURATION
      const directionIndex = Math.floor(elapsed / SCAN_DURATION);
      const currentDirection = SCAN_DIRECTIONS[directionIndex] || 'center';
      setScanDirection(currentDirection);

      if (progress >= 100) {
        setScanComplete(true);
        setIsReadyToPredict(true);
        setFeedback("Scan complete! Click 'Predict Now' for accurate classification.");
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    }, 100);
  };

  const stopFingerprintScan = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setScanProgress(0);
    setScanComplete(false);
    setScanDirection('center');
  };

  const handlePredictNow = async () => {
    if (!scanResult) return;

    setIsScanning(true);
    setCameraError(null);

    try {
      // Send the prediction result
      if (onResult) {
        onResult(scanResult);
      }
      setIsReadyToPredict(false); // Hide button after prediction
      stopFingerprintScan(); // Stop scanning
    } catch (err) {
      console.error("Prediction error:", err);
      setCameraError("Prediction failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const updateFeedback = (data: ClassificationResult) => {
    if (!data.detections.length) {
      setFeedback("No waste detected. Position waste item in the center.");
      stopFingerprintScan();
      setIsReadyToPredict(false);
      return false;
    }

    const bestDetection = data.detections.reduce((prev, current) => {
      return (current.areaRatio ?? 0) > (prev.areaRatio ?? 0) ? current : prev;
    });

    const fill = bestDetection.areaRatio ?? 0;
    const fillPercent = Math.round(fill * 100);

    if (fill < MIN_AREA_RATIO) {
      setFeedback(`Waste detected (${fillPercent}% of frame). Move closer to center for scanning.`);
      stopFingerprintScan();
      setIsReadyToPredict(false);
      return false;
    }

    // Start fingerprint-like scanning when object is properly positioned
    if (!scanComplete && !progressIntervalRef.current) {
      setFeedback("Starting secure scan... Hold steady and follow the directions.");
      startFingerprintScan();
    }

    return true;
  };

  const handleScanResult = (data: ClassificationResult) => {
    updateFeedback(data);
    setScanResult(data);
    drawBoundingBoxes(data.detections);
    // Don't auto-send results; wait for user to click Predict Now
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is not ready yet. Please wait.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      setCameraError("Unable to read camera frame. Please try again.");
      return;
    }

    setIsScanning(true);
    setCameraError(null);

    try {
      const data = await classifyImage(blob, "camera_capture.jpg");
      handleScanResult(data);
    } catch (err) {
      console.error("API error:", err);
      setCameraError("Classification failed. Please try again.");
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[420px] object-cover bg-black"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <div className="absolute left-4 top-4 rounded-2xl bg-slate-950/70 px-3 py-2 text-xs text-white backdrop-blur-sm">
          {videoReady ? "Camera ready" : "Preparing camera..."}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 to-transparent">
          <div className="max-w-md rounded-3xl bg-white/10 border border-white/10 p-4 text-sm text-slate-100 backdrop-blur-sm">
            <p className="font-medium">{feedback}</p>
            {progressIntervalRef.current && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Scan progress</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    ref={progressBarRef}
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  Follow: <span className="font-semibold capitalize">{scanDirection}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {isReadyToPredict && scanComplete && (
          <button
            onClick={handlePredictNow}
            disabled={isScanning}
            className="w-full rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isScanning ? "Authenticating..." : "Predict Now"}
          </button>
        )}

        <button
          aria-label="scan"
          onClick={captureAndScan}
          disabled={isScanning}
          className="w-full rounded-3xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-slate-900/10 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isScanning ? "Scanning..." : "Scan waste item"}
        </button>

        {cameraError && (
          <p className="text-sm text-red-600">{cameraError}</p>
        )}
      </div>
    </div>
  );
};

export default WasteScanner;
