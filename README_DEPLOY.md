# Hướng Dẫn Đóng Gói & Triển Khai Website Thiệp Mời Tốt Nghiệp

Dự án thiệp mời tốt nghiệp tương tác phong cách Ghibli của **Nguyễn Thế Đạt - Kỹ sư CNTT HUBT K27**.

---

## Cấu trúc thư mục đóng gói (`dist/`):
- `index.html`: Giao diện ứng dụng chính (3 chặng: Mở thư sáp đỏ -> Rạp chiếu phim Vlog -> Bàn học khám phá).
- `style.css`: Toàn bộ CSS hệ thống, auto-scale 100%, hiệu ứng ánh nắng, rèm bay, tranh Ghibli.
- `script.js`: Toàn bộ logic frontend, Web Audio API, điều khiển video, sổ lưu bút WishesDB.
- `wishes.json`: Cơ sở dữ liệu lưu lời chúc (đã làm sạch sẵn sàng đón lời chúc thật).
- `range_server.py`: Server Python hỗ trợ tua video mượt mà (HTTP 206 Byte-Range) và API `/api/wishes`.
- `assets/`: Hình ảnh nghệ thuật Ghibli và video Vlog kỷ niệm `vlog_graduation.mp4`.
- `vercel.json` & `api/`: Cấu hình triển khai tự động lên Vercel.
- `Procfile`: Cấu hình chạy trên Render / Railway / Heroku.

---

## Các cách đẩy lên Web (Deploy Options):

### Cách 1: Triển khai nhanh nhất lên Vercel (Miễn phí, HTTPS sẵn)
1. Cài Vercel CLI (nếu chưa có): `npm i -g vercel`
2. Mở terminal tại thư mục `dist/` và gõ:
   ```bash
   vercel
   ```
3. Nhấn Enter làm theo hướng dẫn -> Website sẽ có link public ngay lập tức (ví dụ: `dat-graduation.vercel.app`).

### Cách 2: Triển khai lên Render / Railway (Hỗ trợ lưu wishes.json lâu dài)
1. Đẩy code trong `dist/` lên GitHub repository của bạn.
2. Đăng nhập vào [Render.com](https://render.com) -> New Web Service -> Chọn repo GitHub vừa tạo.
3. Cấu hình:
   - **Build Command**: để trống hoặc `echo ok`
   - **Start Command**: `python range_server.py $PORT`
4. Bấm **Deploy** -> Render sẽ cấp tên miền miễn phí có hỗ trợ lưu trữ file thật!

### Cách 3: Chạy trên VPS (Ubuntu / Debian / CentOS / Windows Server)
1. Copy toàn bộ thư mục `dist/` lên server.
2. Chạy lệnh:
   ```bash
   python range_server.py 80
   ```
3. (Khuyên dùng) Dùng `pm2` hoặc `systemd` để duy trì server chạy ngầm liên tục:
   ```bash
   pm2 start "python range_server.py 80" --name "dat-graduation"
   ```

### Cách 4: Triển khai tĩnh (GitHub Pages / Netlify / Cloudflare Pages)
- Kéo thả thư mục `dist/` vào Netlify Drop hoặc Cloudflare Pages.
- Người dùng gửi lời chúc sẽ được lưu tự động vào `localStorage` của trình duyệt.
