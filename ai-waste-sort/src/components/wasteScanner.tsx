import React, { useRef, useState, useEffect } from "react";
import { classifyImage, ClassificationResult, DetectionResult } from "../services/classification";

interface WasteScannerProps {
  onResult?: (result: ClassificationResult) => void;
}

const WasteScanner: React.FC<WasteScannerProps> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scanResult, setScanResult] = useState<ClassificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      const video = videoRef.current;
      if (video?.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream: MediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#22c55e";
    ctx.fillStyle = "#22c55e";
    ctx.font = "16px Arial";

    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const labelText = `${detection.label} ${Math.round(detection.confidence * 100)}%`;
      ctx.fillText(labelText, Math.max(x1 + 6, 4), Math.max(y1 - 6, 18));
    });
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      setScanResult(data);
      drawBoundingBoxes(data.detections);
      onResult?.(data);
    } catch (err) {
      console.error("API error:", err);
      setCameraError("Classification failed. Please try again.");
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Camera Scanner</h2>

      <div className="relative w-full max-w-3xl rounded-xl overflow-hidden border border-gray-300 shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto bg-black"
        ></video>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      <button
        aria-label="scan"
        onClick={captureAndScan}
        disabled={isScanning}
        className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-60"
      >
        {isScanning ? "Scanning..." : "Scan Waste"}
      </button>

      {cameraError && (
        <p className="mt-4 text-sm text-red-600">{cameraError}</p>
      )}

      {scanResult && (
        <div className="mt-6 w-full max-w-3xl bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Detected {scanResult.count} item{scanResult.count > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-slate-600">
                {scanResult.detections.length} classification results captured from the live feed.
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Total Confidence: {Math.round(scanResult.detections.reduce((sum, item) => sum + item.confidence, 0) / Math.max(scanResult.detections.length, 1) * 100) / 100}%
            </div>
          </div>

          <div className="grid gap-3 mt-4">
            {scanResult.detections.map((detection, index) => (
              <div key={index} className="p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{detection.label}</span>
                  <span className="text-sm text-slate-600">{Math.round(detection.confidence * 100)}%</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Bounding box: [{Math.round(detection.bbox[0])}, {Math.round(detection.bbox[1])}, {Math.round(detection.bbox[2])}, {Math.round(detection.bbox[3])}]
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteScanner;
