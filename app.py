from flask import Flask, render_template, request, jsonify, redirect
import os, base64, time
from fashn_tryon import run_tryon   # ← 새 API 키 넣은 너의 fashn_tryon.py 사용

app = Flask(__name__, template_folder="templates")

# -----------------------------
# 폴더 경로 기본 설정
# -----------------------------
TOP_DIR = "static/tops"
BOTTOM_DIR = "static/bottoms"
OUTFIT_DIR = "static/outfits"
USER_IMG = "static/user.jpg"
RESULT_DIR = "static/results"
os.makedirs(RESULT_DIR, exist_ok=True)


# -----------------------------
# 1) welcome (처음 화면)
# -----------------------------
@app.route("/")
def welcome():
    return render_template("welcome.html")


# -----------------------------
# 2) index
# -----------------------------
@app.route("/start")
def start_page():
    return render_template("index.html")


# -----------------------------
# 3) capture (사진 촬영)
# -----------------------------
@app.route("/capture")
def capture_page():
    return render_template("capture.html")


# -----------------------------
# 4) review (촬영 결과 확인)
# -----------------------------
@app.route("/review")
def review_page():
    return render_template("review.html")


# -----------------------------
# 5) 사진 업로드 (capture → Flask)
# -----------------------------
@app.route("/upload", methods=["POST"])
def upload_image():
    data = request.get_json()
    img_data = data.get("image")

    header, encoded = img_data.split(",", 1)
    decoded = base64.b64decode(encoded)

    with open(USER_IMG, "wb") as f:
        f.write(decoded)

    return jsonify({"success": True})


# -----------------------------
# 6) select (옷 선택 화면)
# -----------------------------
@app.route("/select")
def select_page():
    tops = [f"/static/tops/{f}" for f in os.listdir(TOP_DIR)]
    bottoms = [f"/static/bottoms/{f}" for f in os.listdir(BOTTOM_DIR)]
    return render_template("select.html", tops=tops, bottoms=bottoms)


# -----------------------------
# 7) loading 화면
# -----------------------------
@app.route("/loading")
def loading_page():
    return render_template("loading.html")


# -----------------------------
# 8) TRY-ON (합성 API 실행)
# -----------------------------
@app.route("/tryon", methods=["POST"])
def tryon():
    data = request.get_json()

    top_url = data.get("top")
    bottom_url = data.get("bottom")
    mode = data.get("mode")  # top / bottom / both

    # URL("/static/...") → 파일 경로("static/...")
    def to_file_path(url):
        if not url:
            return None
        return url.replace("/static/", "static/")

    top_path = to_file_path(top_url)
    bottom_path = to_file_path(bottom_url)

    timestamp = int(time.time())

    # 어떤 옷을 합성할지 결정
    if mode == "top" and top_path:
        result_filename = f"result_top_{timestamp}.jpg"
        garment_path = top_path

    elif mode == "bottom" and bottom_path:
        result_filename = f"result_bottom_{timestamp}.jpg"
        garment_path = bottom_path

    elif mode == "both" and top_path and bottom_path:
        # set 파일 찾기
        top_name = os.path.basename(top_path).replace("top", "").split(".")[0]
        bottom_name = os.path.basename(bottom_path).replace("bottom", "").split(".")[0]
        outfit_name = f"set_{top_name}_{bottom_name}.png"
        garment_path = os.path.join(OUTFIT_DIR, outfit_name)

        if not os.path.exists(garment_path):
            return jsonify({"error": f"세트 파일 없음: {garment_path}"}), 400

        result_filename = f"result_set_{top_name}_{bottom_name}_{timestamp}.jpg"

    else:
        return jsonify({"error": "옷 선택 오류"}), 400

    # ------ Fashn API 호출 ------
    result_path = run_tryon(USER_IMG, garment_path, result_filename)

    if not result_path:
        return jsonify({"error": "합성 실패"}), 400

    # URL 변환 (브라우저용)
    result_url = "/" + result_path.replace("\\", "/")
    return jsonify({"result": result_url})


# -----------------------------
# 9) result 화면
# -----------------------------
@app.route("/result")
def result_page():
    image_path = request.args.get("image")
    if not image_path:
        return "이미지가 없습니다.", 404
    return render_template("result.html", result_image=image_path)


# -----------------------------
# Flask 실행
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
