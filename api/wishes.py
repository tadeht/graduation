import json
import urllib.request
from http.server import BaseHTTPRequestHandler

SHEET_URL = "https://script.google.com/macros/s/AKfycbx6OaR2VetLlJ5vR526kIh6f2bRCXGiBInnOys2U4MQB_YMF79bAT9XvCSDdCYHVHRKhA/exec"

def get_wishes():
    try:
        req = urllib.request.Request(SHEET_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode("utf-8")
            return json.loads(data)
    except Exception:
        return []

def save_wish_to_sheet(wish_obj):
    try:
        data = json.dumps(wish_obj, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            SHEET_URL,
            data=data,
            headers={"Content-Type": "text/plain;charset=utf-8", "User-Agent": "Mozilla/5.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            pass
    except Exception:
        pass

class handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        wishes = get_wishes()
        data = json.dumps(wishes, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            new_wish = json.loads(body)
            save_wish_to_sheet(new_wish)
            
            resp = json.dumps({"status": "success", "data": new_wish}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
        except Exception:
            self.send_response(500)
            self.end_headers()
