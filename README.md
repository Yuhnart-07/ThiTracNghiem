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

## Git Workflow

Project chỉ dùng 2 branch:

- `develop`: branch code hằng ngày.
- `main`: branch stable, chỉ cập nhật khi code trên `develop` đã ổn.

Workflow hằng ngày trên `develop`:

```bash
git checkout develop
git pull origin develop

# code

git add .
git commit -m "message"
git push origin develop
```

Khi cần cập nhật bản ổn định, merge `develop` vào `main` sau khi team đã thống nhất.

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
