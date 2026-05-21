# Đóng góp

Project được chuẩn bị cho team nhỏ 2 người. Hãy giữ thay đổi nhỏ, rõ ràng và dễ theo dõi.

## Branch Naming

Project chỉ dùng 2 branch:

```text
main     code ổn định
develop  code hằng ngày
```

Làm việc hằng ngày trên `develop`. Chỉ cập nhật `main` khi code trên `develop` đã ổn và team thống nhất.

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
git checkout develop
git pull origin develop
```

Sau khi code xong:

```bash
npm run lint
npm run format:check
git status
git add .
git commit -m "message"
git push origin develop
```

Khi cần cập nhật bản ổn định, merge `develop` vào `main` sau khi cả team đã thống nhất.

## Avoiding Git Conflicts

- Mỗi thời điểm nên có một người phụ trách chính một module.
- Không format toàn bộ project khi đang làm một feature nhỏ.
- Tránh sửa file dùng chung như `index.js`, `configs/modules.config.js` và layout nếu không cần thiết.
- Pull `develop` mới nhất trước khi bắt đầu task mới.
- Nếu hai người cần sửa cùng một file, hãy thống nhất phạm vi sửa trước.

## Project Rules

- Không thêm auth, logic thi, chấm điểm hoặc bảng database mới nếu team chưa thống nhất.
- Giữ code bám theo cấu trúc Express + Pug + SQL Server hiện có.
- Dùng `THITRACNGHIEM.sql` làm source of truth cho database.
