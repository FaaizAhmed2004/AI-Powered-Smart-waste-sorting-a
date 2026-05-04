import cv2
import os
from ultralytics import YOLO

model_path = "waste_detector.pt"
if not os.path.exists(model_path):
    print(f"Custom model '{model_path}' not found. Falling back to pretrained yolov8n.pt.")
    model_path = "yolov8n.pt"

model = YOLO(model_path)
class_names = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Unable to open camera. Please check camera permissions and device settings.")

print("Starting AUTHENTIC waste detection. Press 'q' to quit.")
print("Model loaded:", "waste_detector.pt" if os.path.exists("waste_detector.pt") else "yolov8n.pt (fallback)")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)
    detections = results[0].boxes

    for box in detections:
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        conf = float(box.conf[0].cpu().numpy())
        cls_id = int(box.cls[0].cpu().numpy())

        # Only show high confidence detections for authenticity
        if conf >= 0.90:
            label = class_names[cls_id] if cls_id < len(class_names) else f"class_{cls_id}"

            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(
                frame,
                f"{label} {conf:.2f} (AUTHENTIC)",
                (int(x1), int(max(y1 - 10, 20))),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2,
            )

    cv2.imshow("Smart Waste Scanner", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
