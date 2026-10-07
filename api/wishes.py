import json
import os
from http.server import BaseHTTPRequestHandler

# In-memory / temporary storage fallback for serverless
WISHES_FILE = "/tmp/wishes.json"

def get_wishes():
    if os.path.exists(WISHES_FILE):
        try:
            with open(WISHES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_wishes(wishes):
    try:
        with open(WISHES_FILE, "w", encoding="utf-8") as f:
            json.dump(wishes, f, ensure_ascii=False, indent=2)
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
            wishes = get_wishes()
            wishes.insert(0, new_wish)
            save_wishes(wishes)
            
            resp = json.dumps({"status": "success", "data": new_wish}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
