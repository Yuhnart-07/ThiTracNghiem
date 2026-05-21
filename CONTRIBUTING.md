# Đóng góp

Project được chuẩn bị cho team nhỏ 2 người. Hãy giữ thay đổi nhỏ, rõ ràng và dễ review.

## Branch Naming

Dùng tên branch ngắn gọn, mô tả đúng việc đang làm:

```text
feature/mon-hoc-crud
feature/sinh-vien-list
fix/sql-connection
docs/readme-update
```

## Commit Naming

Dùng commit message rõ nghĩa:

```text
feat: add mon hoc list skeleton
fix: handle missing sql config
docs: update setup guide
chore: configure prettier
```

## Pull / Push Workflow

Trước khi bắt đầu:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-task
```

Trước khi push:

```bash
npm run lint
npm run format:check
git status
git add .
git commit -m "feat: short message"
git push origin feature/your-task
```

Sau đó tạo Pull Request trên GitHub.

## Avoiding Git Conflicts

- Mỗi thời điểm nên có một người phụ trách chính một module.
- Không format toàn bộ project khi đang làm một feature nhỏ.
- Tránh sửa file dùng chung như `index.js`, `configs/modules.config.js` và layout nếu không cần thiết.
- Pull `main` mới nhất trước khi bắt đầu task mới.
- Nếu hai người cần sửa cùng một file, hãy thống nhất phạm vi sửa trước.

## Project Rules

- Không thêm auth, logic thi, chấm điểm hoặc bảng database mới nếu team chưa thống nhất.
- Giữ code bám theo cấu trúc Express + Pug + SQL Server hiện có.
- Dùng `THITRACNGHIEM.sql` làm source of truth cho database.
