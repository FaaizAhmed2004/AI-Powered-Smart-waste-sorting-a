import argparse
from pathlib import Path
from ultralytics import YOLO


def parse_args():
    parser = argparse.ArgumentParser(description="Train the waste detection YOLO model")
    parser.add_argument("--data", default="data.yaml", help="Path to YOLO data config file")
    parser.add_argument("--weights", default="yolov8n.pt", help="Pretrained model weights")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size for training")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--project", default="runs/train", help="Training project directory")
    parser.add_argument("--name", default="waste_detector", help="Experiment name")
    parser.add_argument("--output", default="waste_detector.pt", help="Path to save final model")
    parser.add_argument("--exist-ok", action="store_true", help="Overwrite existing training output")
    return parser.parse_args()


def main():
    args = parse_args()

    print("Starting YOLO training for waste detection...")
    print(f"Data config: {args.data}")
    print(f"Pretrained weights: {args.weights}")
    print(f"Epochs: {args.epochs}")
    print(f"Image size: {args.imgsz}")
    print(f"Batch size: {args.batch}")
    print(f"Output model: {args.output}")

    model = YOLO(args.weights)
    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        exist_ok=args.exist_ok,
    )

    trained_path = Path(args.project) / args.name / "weights" / "best.pt"
    if not trained_path.exists():
        trained_path = Path(args.project) / args.name / "weights" / "last.pt"

    if not trained_path.exists():
        raise FileNotFoundError(
            f"Could not find trained weights in {args.project}/{args.name}/weights"
        )

    print(f"Saving trained model from {trained_path} to {args.output}")
    YOLO(str(trained_path)).save(args.output)
    print("YOLO model training complete!")


if __name__ == "__main__":
    main()
