import os
import re
import sys
import json
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler

WISHES_FILE = os.path.join(os.path.dirname(__file__), 'wishes.json')

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/wishes'):
            self.handle_get_wishes()
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/wishes'):
            self.handle_post_wish()
            return
        self.send_error(404, "Endpoint not found")

    def handle_get_wishes(self):
        try:
            if os.path.exists(WISHES_FILE):
                with open(WISHES_FILE, 'r', encoding='utf-8') as f:
                    data = f.read()
            else:
                data = "[]"
            body = data.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_error(500, f"Error reading wishes: {str(e)}")

    def handle_post_wish(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))

            name = (payload.get('name') or '').strip()
            wish_text = (payload.get('wish') or '').strip()
            status = payload.get('status') or 'yes'
            
            if not name or not wish_text:
                self.send_error(400, "Name and wish are required")
                return

            new_wish = {
                "id": f"wish-{int(datetime.now().timestamp() * 1000)}",
                "name": name,
                "wish": wish_text,
                "status": status,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

            wishes = []
            if os.path.exists(WISHES_FILE):
                try:
                    with open(WISHES_FILE, 'r', encoding='utf-8') as f:
                        wishes = json.load(f)
                except Exception:
                    wishes = []
            
            wishes.insert(0, new_wish)

            with open(WISHES_FILE, 'w', encoding='utf-8') as f:
                json.dump(wishes, f, ensure_ascii=False, indent=2)

            resp_body = json.dumps(new_wish, ensure_ascii=False).encode('utf-8')
            self.send_response(201)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
        except Exception as e:
            self.send_error(500, f"Error saving wish: {str(e)}")

    def send_head(self):
        if 'Range' not in self.headers:
            self.range = None
            return super().send_head()
        
        path = self.translate_path(self.path)
        f = None
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total_length = fs.st_size
        
        range_header = self.headers['Range'].strip()
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not range_match:
            self.range = None
            return super().send_head()

        first = int(range_match.group(1))
        last = int(range_match.group(2)) if range_match.group(2) else total_length - 1
        if first >= total_length or last >= total_length or first > last:
            self.send_error(416, "Requested Range Not Satisfiable")
            self.send_header('Content-Range', f'bytes */{total_length}')
            self.end_headers()
            return None

        length = last - first + 1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {first}-{last}/{total_length}')
        self.send_header('Content-Length', str(length))
        self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
        self.end_headers()
        f.seek(first)
        self.range = (first, length)
        return f

    def copyfile(self, source, outputfile):
        if not getattr(self, 'range', None):
            return super().copyfile(source, outputfile)
        start, length = self.range
        left = length
        bufsize = 64 * 1024
        while left > 0:
            read_size = min(left, bufsize)
            buf = source.read(read_size)
            if not buf:
                break
            outputfile.write(buf)
            left -= len(buf)

if __name__ == '__main__':
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = HTTPServer(('127.0.0.1', port), RangeRequestHandler)
    print(f"Serving {web_dir} on http://127.0.0.1:{port} with Range & Wishes API support")
    server.serve_forever()
