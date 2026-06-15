# Phase 2 Module Map

Source of truth: `THITRACNGHIEM.sql`.

Phase 2 chi chuan hoa khung module. Chua lam auth, phan quyen, CRUD that, logic thi, chon de, cham diem.

| Module | Table | Admin paths | Ghi chu chia viec |
| --- | --- | --- | --- |
| Mon hoc | `MONHOC` | `/admin/mon-hoc/list`, `/admin/mon-hoc/create`, `/admin/mon-hoc/detail` | CRUD mon hoc |
| Lop | `LOP` | `/admin/lop/list`, `/admin/lop/create`, `/admin/lop/detail` | CRUD lop; lien ket sinh vien qua `MALOP` |
| Sinh vien | `SINHVIEN` | `/admin/sinh-vien/list`, `/admin/sinh-vien/create`, `/admin/sinh-vien/detail` | CRUD sinh vien; sau nay loc theo lop |
| Giao vien | `GIAOVIEN` | `/admin/giao-vien/list`, `/admin/giao-vien/create`, `/admin/giao-vien/detail` | CRUD giao vien; chua gan auth |
| Bo de | `BODE` | `/admin/bo-de/list`, `/admin/bo-de/create`, `/admin/bo-de/detail` | CRUD cau hoi; chua rang buoc giao vien soan |
| Dang ky thi | `GIAOVIEN_DANGKY` | `/admin/dang-ky-thi/list`, `/admin/dang-ky-thi/create`, `/admin/dang-ky-thi/detail` | CRUD lich thi; chua kiem tra du cau hoi |
| Bang diem | `BANGDIEM` | `/admin/bang-diem/list`, `/admin/bang-diem/detail` | Chi khung xem diem; chua cham/ghi diem |

Client skeleton:

| Screen | Path | Ghi chu |
| --- | --- | --- |
| Trang chu | `/` | Gioi thieu pham vi skeleton |
| Thi | `/thi` | Khung chon thong tin thi, chua tao de |
| Xem ket qua | `/thi/ket-qua` | Khung xem ket qua, chua co chi tiet bai lam |

Can chot sau:

- SQL chua co bang luu chi tiet cau hoi da thi va cau tra loi cua sinh vien.
- SQL chua co bang tai khoan app rieng; de bai co yeu cau login/phan quyen.
- De bai va SQL lech mot so kieu/rang buoc: `LOP.MALOP`, `BODE.NOIDUNG`, `GIAOVIEN_DANGKY.THOIGIAN`.
