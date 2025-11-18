import base64
import requests
import time
import os

API_KEY = "fa-0obhFH8IfffG-BaOoDmNMuQ3DwW35oIbDjUNg"
BASE_URL = "https://api.fashn.ai/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def encode_image(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

def run_tryon(model_img_path, garment_img_path, output_filename):
    print(f"🚀 Fashn Try-On 요청 전송 중... ({garment_img_path})")
    result_dir = "static/results"
    os.makedirs(result_dir, exist_ok=True)
    output_path = os.path.join(result_dir, output_filename)

    try:
        model_b64 = encode_image(model_img_path)
        garment_b64 = encode_image(garment_img_path)

        input_data = {
            "model_name": "tryon-v1.6",
            "inputs": {
                "model_image": model_b64,
                "garment_image": garment_b64,
                "category": "auto",
                "segmentation_free": True,
                "moderation_level": "permissive"
            }
        }

        run_response = requests.post(f"{BASE_URL}/run", json=input_data, headers=HEADERS)
        run_data = run_response.json()
        if "id" not in run_data:
            print("❌ API 호출 실패:", run_data)
            return None
        run_id = run_data["id"]

        while True:
            status_resp = requests.get(f"{BASE_URL}/status/{run_id}", headers=HEADERS).json()
            if status_resp["status"] == "completed":
                print("✅ 합성 완료 →", output_path)
                output_urls = status_resp["output"]
                img_data = requests.get(output_urls[0]).content
                with open(output_path, "wb") as f:
                    f.write(img_data)
                return output_path
            elif status_resp["status"] in ["starting", "in_queue", "processing"]:
                print("⏳ 상태:", status_resp["status"])
                time.sleep(3)
            else:
                print("❌ 실패:", status_resp)
                return None
    except Exception as e:
        print("Try-On API 호출 중 예외 발생:", e)
        return None
