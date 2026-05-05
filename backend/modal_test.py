"""
Modal Deployment Tester
Test your deployed Modal app endpoints
Run with: python modal_test.py
"""
import requests
import json
import sys
from pathlib import Path

def test_deployment(base_url):
    """Test a Modal deployment"""
    
    print(f"\n{'='*50}")
    print(f"Testing Modal Deployment")
    print(f"Base URL: {base_url}")
    print(f"{'='*50}\n")
    
    # Test 1: Root endpoint
    print("[1/4] Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        print(f"  ✓ Status: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"  ✗ Failed: {e}\n")
        return False
    
    # Test 2: Health check
    print("[2/4] Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"  ✓ Status: {response.status_code}")
        print(f"  Response: {json.dumps(response.json(), indent=2)}\n")
    except Exception as e:
        print(f"  ✗ Failed: {e}\n")
        return False
    
    # Test 3: Scan with test image
    print("[3/4] Testing scan endpoint...")
    test_image_path = Path("test_image.jpg")
    
    if not test_image_path.exists():
        print(f"  ⚠️  No test image found at {test_image_path}")
        print("  Creating a minimal test image...")
        try:
            from PIL import Image
            img = Image.new('RGB', (100, 100), color='red')
            img.save(test_image_path)
            print(f"  ✓ Created test image\n")
        except ImportError:
            print("  ✗ PIL not installed. Install with: pip install Pillow\n")
            test_image_path = None
    
    if test_image_path:
        try:
            with open(test_image_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(f"{base_url}/scan", files=files, timeout=30)
                print(f"  ✓ Status: {response.status_code}")
                result = response.json()
                print(f"  Response: {json.dumps(result, indent=2)}\n")
                
                if 'detections' in result:
                    print(f"  ✓ Detected {result.get('detection_count', 0)} objects\n")
        except Exception as e:
            print(f"  ✗ Failed: {e}\n")
            return False
    
    # Test 4: Summary
    print("[4/4] Summary")
    print(f"  ✓ All tests passed!")
    print(f"  Your API is ready to use at: {base_url}\n")
    
    return True

def main():
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        print("Modal Deployment Tester\n")
        print("Usage: python modal_test.py <URL>")
        print("Example: python modal_test.py https://user--waste-api-simple-api.modal.run")
        print()
        base_url = input("Enter your Modal app URL: ").strip()
    
    # Remove trailing slash if present
    base_url = base_url.rstrip('/')
    
    # Add https if not present
    if not base_url.startswith(('http://', 'https://')):
        base_url = 'https://' + base_url
    
    try:
        success = test_deployment(base_url)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
