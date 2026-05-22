# Thi Trac Nghiem

Project thi trắc nghiệm dùng Node.js + Express + Pug và SQL Server.

Codebase hiện tại là phần nền đã được dọn và dựng khung qua các phase:

- Phase 1: dựng scaffold SQL Server và dọn domain cũ
- Phase 1.5: dọn public script/asset
- Phase 2: dựng skeleton module dựa trên `THITRACNGHIEM.sql`

Chưa triển khai auth thật, sinh đề thi, chấm điểm hoặc CRUD hoàn chỉnh.

## Tính năng chính

- Quản lý môn học
- Quản lý lớp
- Quản lý sinh viên
- Quản lý đề thi
- Thi trắc nghiệm online
- Chấm điểm

## Tech Stack

- Node.js
- Express
- Pug
- SQL Server
- `mssql`
- ESLint + Prettier

## Installation

```bash
npm install
```

## Environment Setup

Tạo file `.env` local từ `.env.example`:

```bash
copy .env.example .env
```

Điền thông tin SQL Server trên máy local:

```env
PORT=3000
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=THITRACNGHIEM
DB_USER=
DB_PASSWORD=
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Không commit file `.env`.

## Run Project

```bash
npm start
```

Các đường dẫn chính:

- Trang client: `http://localhost:3000/`
- Khung màn hình thi: `http://localhost:3000/thi`
- Dashboard admin: `http://localhost:3000/admin/dashboard`

## Folder Structure

```text
configs/      Cấu hình chung, database config, metadata module
controllers/  Controller xử lý request Express
models/       Metadata bảng SQL và nền data-access
routes/       Định nghĩa route admin/client
views/        Layout, page, partial, mixin Pug
public/       File tĩnh CSS, JS, image
docs/         Ghi chú project và module map
```

## Coding Rules

- Không đổi database schema nếu team chưa thống nhất.
- Giữ module bám theo `THITRACNGHIEM.sql`.
- Không trộn nhiều module không liên quan trong cùng một commit.
- Không tự ý move folder hoặc đổi route nếu chưa trao đổi.
- Chỉ sửa controller/model/view trong phạm vi module đang làm.
- Chạy kiểm tra trước khi push:

```bash
npm run lint
npm run format:check
```

## Quy trình làm Git/GitHub cho đồ án

### 1. Branch của nhóm

Nhóm có 3 branch:

- `main`: code ổn định cuối cùng
- `Phuc`: branch của Phúc
- `Huy`: branch của Huy

### 2. Phân công branch

#### Phuc — Web quản trị hệ thống

- 4.1. Trang đăng nhập
- 4.2. Trang quản lý môn học
- 4.3. Trang quản lý lớp và sinh viên
- 4.4. Trang quản lý giáo viên
- 4.10. Phân quyền web
- 4.11. Trang tạo tài khoản

#### Huy — Web thi trắc nghiệm

- 4.5. Trang nhập câu hỏi thi
- 4.6. Trang đăng ký thi
- 4.7. Trang thi
- 4.8. Trang xem kết quả
- 4.9. Trang bảng điểm môn học

### 3. Quy tắc branch

Không ai code trực tiếp trên `main`.

Mỗi người chỉ code trên branch của mình.

### 4. Trước khi bắt đầu code chức năng mới

Phúc:

```bash
git checkout Phuc
git pull origin main
```

Huy:

```bash
git checkout Huy
git pull origin main
```

### 5. Commit checkpoint khi đang làm

Khi code được một phần ổn định:

```bash
git add .
git commit -m "wip: dang lam chuc nang ..."
```

Commit dùng để lưu checkpoint an toàn. Nếu pull `main` bị conflict hoặc merge lỗi thì vẫn có thể rollback về checkpoint trước đó.

### 6. Commit khi làm xong chức năng

```bash
git add .
git commit -m "xong chuc nang 4.x ..."
```

### 7. Trước khi merge vào main

Phải pull `main` lần nữa:

```bash
git pull origin main
```

Sau đó chạy test:

```bash
npm run dev
```

### 8. Push lên branch cá nhân

Phúc:

```bash
git push origin Phuc
```

Huy:

```bash
git push origin Huy
```

### 9. Tạo Pull Request trên GitHub

Tạo Pull Request:

```txt
Phuc -> main
```

hoặc:

```txt
Huy -> main
```

Chỉ merge vào `main` khi chức năng đã chạy ổn.

### 10. Quy tắc merge

Mỗi lần chỉ 1 người merge.

Ai merge xong phải báo nhóm:

```txt
Đã merge vào main, mọi người pull main về.
```

### 11. Trường hợp đang code dở mà người khác vừa merge vào main

Ví dụ:

- Huy đang code dở chức năng 4.7 trên branch `Huy`
- Phúc vừa merge chức năng 4.1 vào `main`

Lúc này Huy không cần bỏ code đang làm và cũng không phải code lại từ đầu.

Huy nên làm:

```bash
git add .
git commit -m "wip: dang lam chuc nang 4.7"
git pull origin main
```

Sau đó:

- Nếu không conflict: tiếp tục code bình thường.
- Nếu có conflict: sửa conflict, test lại project, rồi commit tiếp.

Quy tắc:

- Không bắt buộc pull `main` ngay lập tức khi đang code dở.
- Nhưng trước khi merge vào `main` thì bắt buộc phải pull `main` mới nhất.
- Nếu đã code lâu trên branch cũ thì nên commit checkpoint rồi pull `main` sớm để giảm conflict.

### 12. File dùng chung phải báo nhóm trước khi sửa

- `index.js`
- `configs/modules.config.js`
- `configs/database.config.js`
- `configs/variable.config.js`
- `routes/admin/index.route.js`
- `routes/client/index.route.js`
- `controllers/admin/module.controller.js`
- `views/admin/pages/module-list.pug`
- `views/admin/pages/module-form.pug`
- `views/admin/layouts/default.pug`
- `views/client/layouts/default.pug`
- `views/admin/partials/sider.pug`
- `public/admin/assets/css/style.css`
- `public/client/assets/css/style.css`
- `package.json`
- `package-lock.json`
- `yarn.lock`
- `THITRACNGHIEM.sql`

### 13. Quy tắc làm việc ngắn gọn

- Không sửa file chung nếu chưa báo người còn lại.
- Không cài package nếu chưa thống nhất.
- Không sửa database SQL nếu chưa chốt với nhóm.
- Không format toàn project khi đang làm feature.
- Mỗi commit chỉ nên tập trung 1 chức năng hoặc 1 lỗi.
- Nếu hai người cần sửa cùng file thì phải chia đoạn rõ trước khi làm.

### 14. Quy tắc cuối

`main` chỉ chứa code chạy được.

Ai merge làm lỗi `main` thì người đó sửa trước.
