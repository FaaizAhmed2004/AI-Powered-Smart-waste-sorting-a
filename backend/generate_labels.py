import os
import glob
from pathlib import Path

# Assuming images are 224x224, and object is centered with size 200x200
IMG_WIDTH = 224
IMG_HEIGHT = 224
OBJ_WIDTH = 200
OBJ_HEIGHT = 200

# Center coordinates
x_center = 0.5
y_center = 0.5
width = OBJ_WIDTH / IMG_WIDTH
height = OBJ_HEIGHT / IMG_HEIGHT

# Class mapping
classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
class_to_id = {cls: i for i, cls in enumerate(classes)}

dataset_path = 'data/dataset-resized'

for class_name in classes:
    class_path = os.path.join(dataset_path, class_name)
    if not os.path.exists(class_path):
        continue

    # Create labels directory if not exists
    labels_dir = os.path.join(dataset_path, 'labels')
    os.makedirs(labels_dir, exist_ok=True)

    images = glob.glob(os.path.join(class_path, '*.jpg')) + glob.glob(os.path.join(class_path, '*.png'))

    for img_path in images:
        img_name = Path(img_path).stem
        label_path = os.path.join(labels_dir, f'{img_name}.txt')

        class_id = class_to_id[class_name]

        # Write YOLO format: class_id x_center y_center width height
        with open(label_path, 'w') as f:
            f.write(f'{class_id} {x_center} {y_center} {width} {height}\n')

print("Labels generated for YOLO training.")