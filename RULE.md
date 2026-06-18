# Rule cho AI/code generation – Module 4.6 Đăng ký thi

## 1. Rule về phạm vi module

Chỉ được viết code phục vụ module **4.6 – Đăng ký thi**.

Module này chỉ xử lý các nghiệp vụ sau:

* Giảng viên xem danh sách đăng ký thi do mình tạo.
* Giảng viên tạo đăng ký thi cho một lớp, môn học và lần thi.
* Giảng viên sửa hoặc xóa đăng ký do mình tạo khi chưa có sinh viên bắt đầu thi và chưa phát sinh điểm.
* Tìm kiếm, lọc đăng ký theo lớp, môn học, trình độ hoặc thời điểm thi.
* Kiểm tra đủ câu theo quy tắc 70%/30%, trùng khóa và chồng lịch trước khi ghi dữ liệu.
* PGV xem toàn bộ danh sách đăng ký để theo dõi, kiểm tra và quản trị ở mức đọc.

Phải xác định rõ người dùng được phép thao tác trong module:

* `PGV`: chỉ xem toàn bộ danh sách; không tạo, sửa, xóa đăng ký thay giảng viên.
* `GIANGVIEN`: xem, tạo, sửa và xóa đăng ký của chính mình theo các điều kiện nghiệp vụ của module.
* `SINHVIEN`: không truy cập module 4.6; chỉ sử dụng lịch thi thông qua module 4.7.

Mỗi đăng ký phải gắn với `MAGV` của giảng viên đang đăng nhập. Theo mục 4.6, `GIANGVIEN` là tác nhân trực tiếp lập đăng ký thi; đề bài không mô tả luồng PGV đăng ký thay, không cho PGV chọn `MAGV`, và cũng không quy định cách quy trách nhiệm chuyên môn khi PGV tạo lịch thay giảng viên. Vì vậy, quyền toàn quyền của PGV trong hệ thống không được hiểu là PGV trở thành giảng viên trong module này: PGV chỉ xem để theo dõi, kiểm tra và quản trị, còn quyền tạo/sửa/xóa vẫn thuộc giảng viên sở hữu đăng ký. Chỉ được thay đổi nguyên tắc này khi người dùng chốt thêm nghiệp vụ đăng ký thay rõ ràng.

Không được tự ý viết thêm chức năng ngoài phạm vi module.

Các chức năng không thuộc phạm vi module này:

* Xác thực mật khẩu, xử lý đăng nhập hoặc tạo tài khoản.
* Thêm, sửa, xóa lớp, môn học, sinh viên, giảng viên hoặc câu hỏi trong `BODE`.
* Chọn ngẫu nhiên câu hỏi, sinh đề, cho sinh viên làm bài hoặc lưu câu trả lời.
* Tính điểm, xem lại bài thi, xem kết quả hoặc in bảng điểm.
* Tự tạo lần thi thứ ba hoặc sửa dữ liệu do module khác quản lý.

Nếu cần sửa hoặc bổ sung chức năng ngoài phạm vi module, phải nêu rõ lý do và chờ người dùng xác nhận trước.

---

## 2. Rule về database

Không được tự ý thay đổi database nếu chưa có lý do rõ ràng.

Trước khi sửa database, bắt buộc phải đọc và đối chiếu với:

* Yêu cầu đề bài.
* Schema database hiện tại.
* File `THITRACNGHIEM.sql`.
* Các stored procedure hiện có.
* Các bảng liên quan trực tiếp đến module.
* Các module liên quan có thể bị ảnh hưởng.

Chỉ được sửa database khi thay đổi đó:

* Phục vụ trực tiếp yêu cầu của module.
* Không làm sai nghiệp vụ đề bài.
* Không phá vỡ module khác.
* Không làm lệch giữa database đang chạy và file `THITRACNGHIEM.sql`.

### 2.1. Bảng chính của module

Module này quản lý chính bảng:

* `GIAOVIEN_DANGKY`

Các thao tác được phép trên bảng chính:

* Xem dữ liệu: Có, theo phạm vi quyền của từng role.
* Thêm dữ liệu: Có, chỉ `GIANGVIEN` tạo đăng ký của mình.
* Sửa dữ liệu: Có, chỉ chủ sở hữu và chỉ khi chưa phát sinh bài thi hoặc điểm.
* Xóa dữ liệu: Có, chỉ chủ sở hữu và chỉ khi chưa phát sinh bài thi hoặc điểm.
* Cập nhật trạng thái: Không; bảng hiện tại không có cột trạng thái đăng ký.

Các cột quan trọng cần chú ý:

* `MAGV` (`NCHAR(8)`): giảng viên tạo đăng ký; lấy từ tài khoản đăng nhập, không nhận từ form.
* `MALOP` (`NCHAR(15)`): lớp được tổ chức thi; phải tồn tại trong `LOP`.
* `MAMH` (`NCHAR(5)`): môn học sẽ thi; phải tồn tại trong `MONHOC`.
* `TRINHDO` (`CHAR(1)`): chỉ nhận `A`, `B` hoặc `C`.
* `NGAYTHI` (`DATETIME`): lưu đầy đủ ngày và giờ bắt đầu; không được nằm trong quá khứ khi tạo hoặc đổi lịch.
* `LAN` (`SMALLINT`): số nguyên từ 1 đến 2.
* `SOCAUTHI` (`SMALLINT`): số nguyên từ 10 đến 100.
* `THOIGIAN` (`SMALLINT`): thời lượng làm bài tính bằng phút, từ 5 đến 60; không phải giờ bắt đầu.

Khóa chính hoặc điều kiện định danh dữ liệu:

* Khóa chính ghép `MAMH + MALOP + LAN`.

Khóa chính này có nghĩa một lớp chỉ có một đăng ký cho cùng môn học và lần thi, không phụ thuộc giảng viên hoặc thời điểm thi. Khi sửa bất kỳ thành phần nào của khóa, phải kiểm tra trùng lại.

### 2.2. Bảng chỉ được đọc

Module được phép đọc dữ liệu từ các bảng:

* `LOP`: hiển thị danh sách lớp và kiểm tra `MALOP` tồn tại.
* `MONHOC`: hiển thị danh sách môn học và kiểm tra `MAMH` tồn tại.
* `GIAOVIEN`: kiểm tra `MAGV` của giảng viên đăng nhập.
* `BODE`: đếm toàn bộ câu hỏi theo `MAMH` và `TRINHDO`, không lọc theo `MAGV` của người soạn.
* `SINHVIEN`: xác định sinh viên thuộc lớp khi kiểm tra đăng ký đã được sử dụng.
* `BAITHI`: kiểm tra đã có sinh viên bắt đầu thi hay chưa.
* `BANGDIEM`: kiểm tra đăng ký đã phát sinh kết quả/điểm hay chưa.
* `vw_LichThi`: đọc danh sách đăng ký kèm tên lớp, môn học và giảng viên.

Không được thêm, sửa, xóa dữ liệu trong các bảng này nếu chúng không thuộc phạm vi module.

`TAIKHOAN` không được module 4.6 truy cập trực tiếp. Role và `MAGV` phải do module đăng nhập cung cấp qua session, token hoặc `req.user`.

### 2.3. Stored procedure / view liên quan

Module được phép gọi hoặc bổ sung các database object sau:

* `sp_GetLop`: lấy `MALOP`, `TENLOP` cho danh sách chọn.
* `sp_GetMonHoc`: lấy `MAMH`, `TENMH` cho danh sách chọn.
* `sp_CheckDuSoCauThi`: kiểm tra trước số câu theo quy tắc 70%/30%.
* `sp_DangKyThi`: kiểm tra lại toàn bộ điều kiện quan trọng và ghi đăng ký.
* `vw_LichThi`: hiển thị danh sách đăng ký kèm dữ liệu mô tả.
* `sp_SuaDangKyThi`: procedure sửa đăng ký; kiểm tra chủ sở hữu, trùng khóa, chồng lịch, đủ câu và khóa sửa sau khi phát sinh bài thi/điểm.
* `sp_XoaDangKyThi`: procedure xóa đăng ký; kiểm tra chủ sở hữu và khóa xóa sau khi phát sinh bài thi/điểm.

`sp_DangKyThi` bắt buộc phải kiểm tra giảng viên/lớp/môn tồn tại, miền giá trị, ngày thi không trong quá khứ, trùng khóa, chồng lịch và đủ câu. Việc kiểm tra đủ câu và `INSERT` phải nằm trong cùng stored procedure và transaction để tránh dữ liệu thay đổi giữa hai bước.

Nếu stored procedure chưa tồn tại, chỉ được tạo mới khi:

* Có yêu cầu nghiệp vụ rõ ràng.
* Không trùng chức năng với procedure đã có.
* Không làm thay đổi hành vi của module khác.
* Có cập nhật lại vào `THITRACNGHIEM.sql` nếu đã sửa database thật.

### 2.4. Các thay đổi database được phép thực hiện

Chỉ được thực hiện các thay đổi sau nếu phục vụ trực tiếp module:

* Bổ sung hoặc chỉnh sửa stored procedure phục vụ module.
* Chỉnh sửa `sp_DangKyThi` để bổ sung kiểm tra ngày quá khứ, chồng lịch, transaction và thông báo lỗi chi tiết nếu còn thiếu.
* Chỉnh sửa `sp_CheckDuSoCauThi` nếu cần để trả đủ số câu đúng trình độ, số câu thấp hơn và mức tối thiểu.
* Bổ sung hoặc chỉnh sửa `sp_SuaDangKyThi`, `sp_XoaDangKyThi` nếu chưa có hoặc chưa đáp ứng đủ nghiệp vụ.
* Bổ sung view phục vụ hiển thị dữ liệu nếu cần.
* Bổ sung index nếu có lý do rõ ràng về hiệu năng.
* Bổ sung constraint nếu đúng với đề bài và không phá dữ liệu hiện có.
* Sửa lỗi database nhỏ nếu đang làm module không thể chạy đúng.

### 2.5. Các thay đổi database không được tự ý thực hiện

Không được tự ý:

* Thêm bảng audit log.
* Thêm soft delete.
* Thêm versioning dữ liệu.
* Đổi tên bảng.
* Đổi tên cột.
* Đổi kiểu dữ liệu của cột quan trọng.
* Xóa khóa chính.
* Xóa khóa ngoại.
* Đổi cấu trúc tổng thể database.
* Tạo bảng mới nếu chưa được yêu cầu.
* Tự ý thay đổi quan hệ giữa các bảng.
* Thêm cột giờ bắt đầu riêng; `NGAYTHI` đã lưu đầy đủ ngày và giờ.
* Tự tạo dữ liệu trong `BODE` để làm cho đủ số câu.
* Xóa khóa chính `MAMH + MALOP + LAN` hoặc các khóa ngoại của `GIAOVIEN_DANGKY`.

Nếu thay đổi database có nguy cơ ảnh hưởng module khác, phải giải thích rủi ro và hỏi người dùng trước.

### 2.6. Đồng bộ database

Nếu có sửa database trong Docker hoặc SQL Server thật, bắt buộc phải:

* Nêu rõ đã sửa gì.
* Nêu rõ sửa ở bảng/procedure/view nào.
* Nêu lý do sửa.
* Đồng bộ thay đổi vào file `THITRACNGHIEM.sql`.
* Báo nếu chưa đồng bộ được.

---

## 3. Rule về phân quyền

Phải tuân thủ đúng phân quyền của hệ thống.

Cần xác định rõ quyền theo từng role:

### 3.1. PGV

`PGV` được quyền:

* Xem toàn bộ danh sách đăng ký thi để theo dõi.
* Tìm kiếm và lọc danh sách đăng ký.
* Xem thông tin lớp, môn, giảng viên, thời điểm và cấu hình kỳ thi.

`PGV` không được quyền:

* Tạo đăng ký thay giảng viên khi chưa có nghiệp vụ chọn `MAGV` và đăng ký thay.
* Sửa hoặc xóa đăng ký trong luồng nghiệp vụ chính của module 4.6.

Lý do giới hạn này không mâu thuẫn với quyền quản trị chung của PGV: đề bài xác định giảng viên là người trực tiếp đăng ký thi và `MAGV` phải lấy từ tài khoản giảng viên đăng nhập, trong khi không có nghiệp vụ PGV đăng ký thay hoặc chọn giảng viên chịu trách nhiệm. Do đó PGV có quyền xem toàn bộ để quản trị, nhưng không có quyền ghi trong module 4.6 khi luồng đăng ký thay chưa được chốt.

### 3.2. GIANGVIEN

`GIANGVIEN` được quyền:

* Xem danh sách đăng ký có `MAGV` của mình.
* Tạo đăng ký thi gắn với `MAGV` của mình.
* Sửa hoặc xóa đăng ký do mình tạo nếu chưa phát sinh bài thi hoặc điểm.

`GIANGVIEN` không được quyền:

* Xem hoặc thao tác đăng ký của giảng viên khác.
* Giả mạo `MAGV`, sửa/xóa đăng ký đã phát sinh bài thi hoặc điểm.

Nếu dữ liệu gắn với giảng viên, hệ thống phải lấy `MAGV` từ tài khoản đăng nhập, không nhận `MAGV` từ form hoặc request body.

### 3.3. SINHVIEN

`SINHVIEN` được quyền:

* Không có quyền thao tác trực tiếp trong module 4.6.
* Sử dụng lịch thi thông qua module 4.7 theo quyền riêng của module thi.

`SINHVIEN` không được quyền:

* Truy cập giao diện hoặc API quản lý đăng ký thi.
* Xem danh sách quản trị, thêm, sửa hoặc xóa đăng ký.

### 3.4. Nguyên tắc kiểm tra quyền

* Phải kiểm tra người dùng đã đăng nhập.
* Phải kiểm tra role trước khi cho truy cập module.
* Phải kiểm tra quyền trước khi thêm, sửa, xóa hoặc ghi dữ liệu.
* Phải kiểm tra chủ sở hữu bằng `MAGV` trước khi sửa hoặc xóa.
* Không tin dữ liệu quyền gửi từ client.
* Thông tin user phải lấy từ session/token/auth middleware.
* Nếu không đủ quyền, phải dừng xử lý và trả lỗi rõ ràng.

---

## 4. Rule về Controller, Service, Repository

Không được viết lẫn trách nhiệm giữa Controller, Service và Repository.

### 4.1. Controller

Controller chỉ được làm:

* Nhận request.
* Lấy dữ liệu từ `req.body`, `req.params`, `req.query`.
* Lấy thông tin người dùng đăng nhập từ session hoặc middleware.
* Gọi Service.
* Trả response JSON hoặc render giao diện.
* Điều hướng khi cần.

Controller không được:

* Viết SQL trực tiếp.
* Gọi database trực tiếp.
* Xử lý nghiệp vụ phức tạp.
* Tự quyết định logic phân quyền sâu.
* Gom toàn bộ code của module vào Controller.

### 4.2. Service

Service chịu trách nhiệm:

* Kiểm tra quyền.
* Validate dữ liệu nghiệp vụ.
* Kiểm tra điều kiện hợp lệ / không hợp lệ.
* Kiểm tra dữ liệu tồn tại.
* Kiểm tra dữ liệu trùng.
* Kiểm tra dữ liệu có bị ràng buộc với module khác không.
* Chuẩn hóa dữ liệu trước khi ghi.
* Gọi Repository để truy vấn database.
* Xử lý kết quả Repository trả về.
* Trả lỗi nghiệp vụ rõ ràng cho Controller.
* Lấy `MAGV` từ tài khoản đăng nhập và không sử dụng `MAGV` do client gửi.
* Điều phối kiểm tra đủ câu, trùng khóa và chồng lịch.
* Chặn sửa/xóa khi đăng ký đã phát sinh `BAITHI` hoặc `BANGDIEM`.

Service không được:

* Viết SQL dài trực tiếp nếu project đã có Repository.
* Render giao diện.
* Nhận dữ liệu nhạy cảm từ client nếu dữ liệu đó phải lấy từ tài khoản đăng nhập.
* Tự ý gọi sang module khác nếu không thuộc phạm vi.

### 4.3. Repository

Repository chịu trách nhiệm:

* Gọi query.
* Gọi stored procedure.
* Gọi view nếu cần.
* Truy vấn danh sách dữ liệu.
* Truy vấn chi tiết dữ liệu.
* Kiểm tra tồn tại ở mức database.
* Trả dữ liệu thô hoặc dữ liệu đã map đơn giản về Service.
* Gọi `sp_GetLop`, `sp_GetMonHoc`, `sp_CheckDuSoCauThi`, `sp_DangKyThi`, `sp_SuaDangKyThi` và `sp_XoaDangKyThi`.
* Đọc `vw_LichThi`, `BAITHI`, `BANGDIEM` khi Service yêu cầu.
* Khai báo đúng kiểu `mssql`: `NChar`, `Char`, `SmallInt`, `DateTime` theo schema.
* Chuyển lỗi SQL/stored procedure về Service.

Repository không được:

* Tự quyết định phân quyền nghiệp vụ.
* Tự xử lý logic nghiệp vụ phức tạp.
* Render giao diện.
* Nhận request trực tiếp.
* Tự ý sửa nhiều bảng ngoài phạm vi module.

---

## 5. Rule về dữ liệu đầu vào

Phải validate dữ liệu trước khi lưu.

### 5.1. Dữ liệu người dùng nhập

Các trường cần validate:

* `maLop`: bắt buộc; chuỗi; chọn từ `LOP`.
* `maMonHoc`: bắt buộc; chuỗi; chọn từ `MONHOC`.
* `trinhDo`: bắt buộc; chỉ nhận `A`, `B`, `C`.
* `lan`: bắt buộc; số nguyên từ 1 đến 2.
* `soCauThi`: bắt buộc; số nguyên từ 10 đến 100.
* `ngayThi`: bắt buộc; ngày giờ hợp lệ, lưu đầy đủ ngày và giờ, không nằm trong quá khứ.
* `thoiGian`: bắt buộc; số nguyên từ 5 đến 60 phút.

`THOIGIAN` là thời lượng làm bài, không phải giờ bắt đầu. Thời điểm kết thúc dự kiến được tính bằng `NGAYTHI + THOIGIAN`.

### 5.2. Dữ liệu người dùng chọn từ danh sách

Các dữ liệu chọn từ danh sách phải được kiểm tra tồn tại trong database:

* `MALOP` phải tồn tại trong `LOP`; UI hiển thị `TENLOP` nhưng chỉ lưu `MALOP`.
* `MAMH` phải tồn tại trong `MONHOC`; UI hiển thị `TENMH` nhưng chỉ lưu `MAMH`.
* `TRINHDO` phải thuộc tập `A`, `B`, `C`.
* `LAN` phải thuộc tập `1`, `2`.

Không chỉ tin dữ liệu gửi từ UI.

### 5.3. Dữ liệu hệ thống tự lấy

Các dữ liệu sau không được nhận từ form nếu chúng phải do hệ thống xác định:

* Mã người dùng đăng nhập.
* Role người dùng.
* Mã giảng viên nếu gắn với tài khoản đăng nhập.
* Mã sinh viên nếu gắn với tài khoản đăng nhập.
* Ngày tạo nếu database đã có default.
* Mã tự sinh nếu database tự sinh.

Riêng module 4.6, không được nhận `MAGV` hoặc role từ form. Nếu client gửi `MAGV`, backend không được dùng giá trị đó để ghi dữ liệu hoặc xác định quyền.

### 5.4. Điều kiện validate chung

* Không bỏ trống trường bắt buộc.
* Không nhập sai kiểu dữ liệu.
* Không nhập sai định dạng.
* Không nhập vượt độ dài cột trong database.
* Không nhập giá trị ngoài tập cho phép.
* Không nhập dữ liệu trùng khóa chính hoặc unique.
* Không ghi dữ liệu nếu khóa ngoại không tồn tại.
* Không cho user gửi dữ liệu nhạy cảm để giả mạo quyền.

---

## 6. Rule về thêm, sửa, xóa dữ liệu

### 6.1. Khi thêm dữ liệu

Phải kiểm tra:

* Người dùng có quyền thêm không.
* Dữ liệu bắt buộc đã đầy đủ chưa.
* Dữ liệu có đúng format không.
* Dữ liệu có trùng không.
* Khóa ngoại có tồn tại không.
* Các điều kiện nghiệp vụ đặc thù của module đã thỏa chưa.

Riêng module 4.6, phải kiểm tra thêm:

* Người dùng đã đăng nhập, có role `GIANGVIEN` và có `MAGV` hợp lệ.
* Dữ liệu bắt buộc đã đầy đủ và đúng format.
* Giảng viên, lớp và môn học tồn tại.
* `NGAYTHI` không nằm trong quá khứ.
* Không trùng khóa `MAMH + MALOP + LAN`.
* Không chồng lịch của cùng lớp hoặc cùng giảng viên.
* Ngân hàng `BODE` đủ câu theo môn và trình độ.

Quy tắc đủ câu 70%/30%:

* Gọi `N` là `SOCAUTHI`; `QA`, `QB`, `QC` là số câu hiện có của môn học theo trình độ A, B, C.
* Số câu tối thiểu đúng trình độ là `CEILING(N * 0.7)`.
* Đề trình độ A: `QA >= CEILING(N * 0.7)` và `QA + QB >= N`; chỉ được bù tối đa 30% bằng câu B, không dùng câu C.
* Đề trình độ B: `QB >= CEILING(N * 0.7)` và `QB + QC >= N`; chỉ được bù tối đa 30% bằng câu C.
* Đề trình độ C: `QC >= N`; không lấy câu trình độ khác.
* Không lấy câu cao hơn trình độ đăng ký và không hạ quá một bậc.
* Đếm toàn bộ câu hỏi trong `BODE` theo `MAMH`, `TRINHDO`; tuyệt đối không lọc theo `BODE.MAGV`.

Quy tắc chống lịch:

* Khoảng thi tính từ `NGAYTHI` đến `DATEADD(MINUTE, THOIGIAN, NGAYTHI)`.
* Hai lịch trùng khi `newStart < existingEnd` và `newEnd > existingStart`.
* Phải áp dụng với mọi lịch khác của cùng `MALOP` hoặc cùng `MAGV`.
* Hai lịch nối tiếp, lịch sau bắt đầu đúng lúc lịch trước kết thúc, vẫn hợp lệ.

Nếu dữ liệu hợp lệ:

* Gọi Service xử lý nghiệp vụ.
* Service gọi Repository.
* Repository gọi stored procedure/query để ghi database.
* Trả thông báo thành công.
* Repository gọi `sp_DangKyThi` để kiểm tra lại và ghi database.
* Kiểm tra đủ câu và `INSERT` phải nằm trong cùng transaction.
* Trả thông báo thành công và tải lại danh sách/chọn bản ghi vừa tạo.

Nếu dữ liệu không hợp lệ:

* Dừng xử lý.
* Không ghi database.
* Trả thông báo lỗi rõ ràng.
* Giữ lại dữ liệu form nếu phù hợp; lỗi thiếu câu nên nêu số câu hiện có và số tối thiểu cần có.

### 6.2. Khi sửa dữ liệu

Phải kiểm tra:

* Người dùng có quyền sửa không.
* Dữ liệu cần sửa có tồn tại không.
* Người dùng có quyền sửa bản ghi đó không.
* Dữ liệu mới có hợp lệ không.
* Dữ liệu có bị ràng buộc bởi module khác không.
* Có được phép sửa bản ghi sau khi đã phát sinh dữ liệu liên quan không.

Riêng module 4.6, phải kiểm tra thêm:

* Người dùng là `GIANGVIEN` và đăng ký cần sửa tồn tại.
* `MAGV` của đăng ký trùng với `MAGV` của tài khoản đăng nhập.
* Chưa có sinh viên bắt đầu thi và chưa phát sinh bài thi, kết quả hoặc điểm liên quan.
* Dữ liệu mới hợp lệ theo toàn bộ quy tắc của thao tác thêm.
* Nếu sửa `MAMH`, `MALOP` hoặc `LAN`, phải kiểm tra trùng khóa mới.
* Khi kiểm tra chồng lịch phải loại trừ chính bản ghi đang sửa.
* Phải kiểm tra lại đủ câu nếu `MAMH`, `TRINHDO` hoặc `SOCAUTHI` thay đổi.

Nếu không đủ điều kiện, phải từ chối sửa.

Chức năng "Phục hồi" trên UI chỉ trả form về dữ liệu trước khi chỉnh sửa, không ghi database.

### 6.3. Khi xóa dữ liệu

Phải kiểm tra:

* Người dùng có quyền xóa không.
* Dữ liệu cần xóa có tồn tại không.
* Người dùng có quyền xóa bản ghi đó không.
* Dữ liệu đã phát sinh ràng buộc ở module khác chưa.
* Nếu đã phát sinh dữ liệu liên quan, không được xóa trực tiếp nếu có nguy cơ phá toàn vẹn dữ liệu.

Riêng module 4.6, phải kiểm tra thêm:

* Người dùng là `GIANGVIEN` và đăng ký cần xóa tồn tại.
* `MAGV` của đăng ký trùng với `MAGV` của tài khoản đăng nhập.
* Chưa có sinh viên bắt đầu thi.
* Chưa phát sinh bất kỳ `BAITHI` hoặc `BANGDIEM` liên quan đến lớp, môn học và lần thi.
* UI phải yêu cầu xác nhận trước khi xóa.

Nếu không đủ điều kiện, phải từ chối xóa và báo lý do.

Nếu đã phát sinh bài thi, kết quả hoặc điểm, không được xóa trực tiếp để bảo toàn cấu hình kỳ thi và dữ liệu đối chiếu.

---

## 7. Rule về cấu trúc project

Phải viết code đúng cấu trúc project hiện có.

Không được tự ý tạo thư mục mới nếu chưa cần thiết.

Nếu project đang chia theo mô hình:

* `controllers/`
* `services/`
* `repositories/`
* `routes/`
* `views/`
* `public/`
* `middlewares/`
* `utils/` nếu đã có

thì code của module phải đặt đúng vào các thư mục tương ứng.

Không được:

* Gom toàn bộ logic vào một file.
* Tạo file trùng chức năng với file đã có.
* Tạo cấu trúc mới khác convention hiện tại.
* Đổi tên file cũ nếu không có lý do bắt buộc.
* Sửa file module khác nếu không liên quan trực tiếp.

### 7.1. Cấu trúc thật và thứ tự ưu tiên sửa file

Các file sau **đã tồn tại**, phải ưu tiên sửa và tái sử dụng, không được tạo file khác trùng trách nhiệm:

```text
controllers/admin/exam-registration.controller.js
views/admin/pages/exam-registration.pug
routes/admin/index.route.js
views/admin/partials/sider.pug
controllers/lecturer/index.controller.js
routes/lecturer/index.route.js
views/lecturer/partials/sider.pug
public/admin/assets/css/style.css
public/admin/assets/js/script.js
public/lecturer/assets/css/style.css
public/lecturer/assets/js/script.js
```

Thứ tự ưu tiên cụ thể:

* Luồng PGV chỉ xem: ưu tiên sửa `controllers/admin/exam-registration.controller.js`, `views/admin/pages/exam-registration.pug` và route `/exam-registration` đã có trong `routes/admin/index.route.js`. Không tạo thêm controller, route hoặc view admin khác cho cùng màn hình.
* Luồng giảng viên: ưu tiên bổ sung handler vào `controllers/lecturer/index.controller.js` và route vào `routes/lecturer/index.route.js` theo convention hiện tại; không tự tạo `controllers/lecturer/exam-registration.controller.js` hoặc `routes/lecturer/exam-registration.route.js` khi chưa có lý do tách module rõ ràng.
* Menu giảng viên: sửa `views/lecturer/partials/sider.pug` để thêm đường dẫn đăng ký thi. Chỉ sửa `views/admin/partials/sider.pug` nếu cần điều chỉnh mục PGV đã có.
* CSS dùng chung: ưu tiên bổ sung có kiểm soát vào `public/admin/assets/css/style.css` hoặc `public/lecturer/assets/css/style.css`; không tạo CSS mới nếu style dùng chung đã đáp ứng.
* JavaScript dùng chung chỉ được sửa khi thay đổi thực sự dùng chung. Logic riêng của màn hình nên tách thành file module để tránh làm phình `script.js`.

Các file sau hiện **chưa tồn tại** và chỉ được tạo khi triển khai đúng tầng tương ứng:

```text
services/lecturer/exam-registration.service.js
repositories/lecturer/exam-registration.repository.js
views/lecturer/pages/exam-registration.pug
public/lecturer/assets/js/exam-registration.js
public/admin/assets/js/exam-registration.js
```

`services/lecturer/exam-registration.service.js` và `repositories/lecturer/exam-registration.repository.js` là lớp nghiệp vụ/dữ liệu dùng chung cho thao tác đăng ký của giảng viên; controller admin chỉ được dùng các hàm đọc phù hợp để phục vụ PGV. Trước khi tạo bất kỳ file nào trong danh sách chưa tồn tại, phải tìm lại toàn project để tránh trùng với thay đổi mới của người dùng.

---

## 8. Rule về style code

Code phải tuân thủ style hiện tại của project.

Yêu cầu chung:

* Code rõ ràng, dễ đọc.
* Tên biến, tên hàm, tên file có ý nghĩa.
* Không viết hàm quá dài nếu có thể tách nhỏ.
* Không lặp code không cần thiết.
* Không hard-code dữ liệu nghiệp vụ nếu có thể lấy từ database hoặc config.
* Không để console log debug dư thừa.
* Không để code chết, code test tạm.
* Không để comment sai với logic thật.
* Không nuốt lỗi im lặng.
* Không trả lỗi chung chung nếu có thể trả lỗi rõ ràng.

### 8.1. Xử lý lỗi

Khi có lỗi:

* Service phải trả lỗi nghiệp vụ rõ ràng.
* Controller phải hiển thị hoặc trả response phù hợp.
* Không làm lộ thông tin nhạy cảm của database.
* Không trả stack trace ra giao diện người dùng.
* Lỗi validate phải báo đúng trường gây lỗi nếu có thể.

### 8.2. Response / render

Nếu là API:

* Trả status code phù hợp.
* Trả message rõ ràng.
* Trả data cần thiết, không trả dư.

Nếu là render view:

* Giữ lại dữ liệu người dùng đã nhập khi lỗi nếu phù hợp.
* Hiển thị message lỗi hoặc thành công rõ ràng.
* Reload lại danh sách sau khi thao tác thành công.

---

## 9. Rule về comment và giải thích luồng code

Không comment qua loa theo kiểu chỉ ghi tên hàm.

Comment phải giúp người đọc hiểu được pipeline xử lý bên trong code:

* Đoạn logic này đang ở bước nào.
* Vì sao cần bước kiểm tra này.
* Nếu bỏ bước này thì có rủi ro gì.
* Dữ liệu sau bước này sẽ đi đâu.

Không bắt buộc comment từng dòng, nhưng phải comment ở các đoạn nghiệp vụ quan trọng.

Các đoạn nên có comment:

* Kiểm tra quyền theo role.
* Lấy thông tin người dùng từ session/auth.
* Từ chối dữ liệu nhạy cảm nếu client gửi lên.
* Validate dữ liệu nghiệp vụ.
* Kiểm tra dữ liệu tồn tại.
* Kiểm tra dữ liệu trùng.
* Kiểm tra ràng buộc với module khác trước khi sửa/xóa.
* Gọi stored procedure/query quan trọng.
* Xử lý nhánh thành công và nhánh lỗi.

Riêng module 4.6, phải ưu tiên comment tại các đoạn:

* Lấy `MAGV` từ session/auth và từ chối giá trị client gửi.
* Kiểm tra đủ câu theo quy tắc 70%/30% và không lọc theo `BODE.MAGV`.
* Kiểm tra trùng `MAMH + MALOP + LAN` và chồng lịch của cùng lớp/giảng viên.
* Kiểm tra chủ sở hữu và dữ liệu `BAITHI`/`BANGDIEM` trước khi sửa/xóa.
* Giữ kiểm tra đủ câu và thao tác ghi trong cùng transaction.

Ví dụ comment đúng hướng:

```js
// Bước 1: Lấy thông tin người dùng đăng nhập từ session để tránh client giả mạo quyền
const currentUser = req.user;

// Bước 2: Validate dữ liệu nghiệp vụ trước khi gọi repository để hạn chế ghi dữ liệu sai xuống database
const payload = validatePayload(req.body);

// Bước 3: Gọi service xử lý nghiệp vụ chính của module
await moduleService.create(payload, currentUser);
```

Không comment quá nhiều ở các dòng đơn giản như import, gán biến, hoặc return dữ liệu thông thường.

---

## 10. Rule về quy tắc đặt tên

Tên file, function, biến và route phải rõ nghĩa, nhìn vào có thể hiểu được chức năng chính.

Phải tuân theo convention hiện tại của project.

Quy tắc đặt tên:

* Tên file phải thể hiện đúng module.
* Tên controller phải thể hiện controller thuộc module nào.
* Tên service phải thể hiện nghiệp vụ đang xử lý.
* Tên repository phải thể hiện nhóm truy vấn dữ liệu liên quan.
* Tên hàm nên bắt đầu bằng động từ.
* Tên route phải thể hiện đúng tài nguyên hoặc hành động nghiệp vụ.
* Tên biến phải rõ nghĩa.
* Tránh viết tắt khó hiểu.
* Tránh tên mơ hồ.

Ví dụ tên hàm nên rõ nghĩa:

```js
getAllRegistrations()
getRegistrationDetail()
createRegistration()
updateRegistration()
deleteRegistration()
checkRegistrationExists()
validateRegistrationPayload()
```

Không đặt tên mơ hồ như:

```js
handle()
process()
doUpdate()
data()
test()
run()
```

Nếu project hiện tại đã có quy tắc đặt tên khác, phải ưu tiên tuân thủ quy tắc hiện có.

---

## 11. Rule về giới hạn sinh code

Không được tự ý:

* Viết lại toàn bộ module khác.
* Sửa file không liên quan.
* Đổi cấu trúc project.
* Đổi database schema ngoài phạm vi module.
* Tạo bảng mới nếu chưa được yêu cầu.
* Tạo stored procedure trùng chức năng với procedure đã có.
* Tạo audit log nếu chưa được yêu cầu.
* Tạo soft delete nếu chưa được yêu cầu.
* Tạo versioning nếu chưa được yêu cầu.
* Tự ý thay đổi phân quyền.
* Cho role không hợp lệ truy cập module.
* Nhận dữ liệu nhạy cảm từ form thay vì lấy từ tài khoản đăng nhập.
* Hard-code dữ liệu có thể lấy từ database.
* Làm thay chức năng của module khác.
* Cho PGV tạo, sửa, xóa đăng ký thay giảng viên khi chưa có nghiệp vụ rõ ràng.
* Cho sinh viên truy cập giao diện/API quản lý đăng ký.
* Nhận `MAGV` từ form thay vì lấy từ tài khoản đăng nhập.
* Lọc câu hỏi theo `BODE.MAGV` khi kiểm tra đủ câu.
* Bỏ qua quy tắc 70%/30%, trùng khóa, chồng lịch hoặc khóa sửa/xóa.
* Sửa/xóa đăng ký đã phát sinh bài thi, kết quả hoặc điểm.
* Tự thêm câu hỏi, sinh đề, tổ chức thi hoặc tính điểm trong module này.

Nếu cần thay đổi ngoài phạm vi module, phải nêu rõ lý do và chờ xác nhận trước.

---

## 12. Rule về test và review

Sau khi code xong phải kiểm tra các nhóm case sau:

### 12.1. Case đúng

* Người dùng đúng quyền truy cập module.
* Nhập đầy đủ dữ liệu hợp lệ.
* Thao tác thêm/sửa/xóa/xem chạy đúng.
* Database ghi đúng bảng, đúng cột.
* Giao diện hiển thị đúng kết quả.
* Giảng viên chỉ xem và thao tác đăng ký của mình; PGV chỉ xem toàn bộ.
* Đề A/B đủ câu cùng trình độ hoặc có ít nhất 70% đúng trình độ và đủ câu thấp hơn một bậc để bù.
* Đề C có đủ toàn bộ câu C.
* Hai lịch nối tiếp đúng điểm kết thúc/bắt đầu được chấp nhận.

### 12.2. Case sai dữ liệu

* Thiếu trường bắt buộc.
* Sai định dạng.
* Sai kiểu dữ liệu.
* Vượt độ dài cột.
* Giá trị ngoài tập cho phép.
* Dữ liệu trùng.
* Dữ liệu khóa ngoại không tồn tại.
* `NGAYTHI` nằm trong quá khứ.
* Trùng `MAMH + MALOP + LAN`.
* Chồng lịch của cùng lớp hoặc cùng giảng viên.
* Thiếu số câu đúng trình độ dù tổng câu thấp hơn rất nhiều.

### 12.3. Case sai quyền

* Chưa đăng nhập.
* Đăng nhập sai role.
* Role không được phép thêm/sửa/xóa.
* Người dùng cố thao tác dữ liệu không thuộc quyền của mình.
* Client cố gửi dữ liệu giả mạo quyền.
* PGV cố gọi API thêm/sửa/xóa.
* Sinh viên cố truy cập module.
* Giảng viên cố xem/sửa/xóa đăng ký của người khác.

### 12.4. Case ràng buộc module khác

* Dữ liệu đã phát sinh ở module khác.
* Dữ liệu đang được bảng khác tham chiếu.
* Không được xóa nếu có nguy cơ phá toàn vẹn dữ liệu.
* Không được sửa nếu làm sai dữ liệu đã phát sinh.
* Khóa cả sửa và xóa khi đã có `BAITHI` hoặc `BANGDIEM`.
* Không ghi vào `LOP`, `MONHOC`, `GIAOVIEN`, `BODE`, `SINHVIEN`, `TAIKHOAN`, `BAITHI`, `BAITHI_CHITIET`, `BANGDIEM`.

### 12.5. Case lỗi hệ thống

* Stored procedure trả lỗi.
* Database connection lỗi.
* Query không trả dữ liệu.
* Dữ liệu rỗng.
* Request không hợp lệ.
* Transaction lỗi phải rollback, không để lại đăng ký ghi dở dang.
* Ngân hàng câu hỏi thay đổi đồng thời giữa lúc kiểm tra và lúc ghi không được tạo đăng ký sai.

---

## 13. Rule về báo cáo phần đã làm/sửa

Sau khi sinh code hoặc chỉnh sửa code, phải liệt kê rõ các phần đã làm.

Báo cáo sau khi hoàn thành cần có:

* File đã tạo mới.
* File đã chỉnh sửa.
* Database object đã chỉnh sửa hoặc bổ sung.
* Hàm/API/route đã thêm.
* Stored procedure đã tạo hoặc chỉnh sửa.
* View đã tạo hoặc chỉnh sửa nếu có.
* Các rule nghiệp vụ đã triển khai.
* Các rule phân quyền đã triển khai.
* Các module liên quan đã kiểm tra để tránh ảnh hưởng.
* Các lỗi hoặc rủi ro còn lại nếu có.

Mẫu báo cáo:

```text
Đã thực hiện:
- Sửa file hiện có: controllers/admin/exam-registration.controller.js
- Sửa file hiện có: views/admin/pages/exam-registration.pug
- Sửa file hiện có: controllers/lecturer/index.controller.js
- Sửa file hiện có: routes/admin/index.route.js, routes/lecturer/index.route.js
- Tạo file nếu còn thiếu: services/lecturer/exam-registration.service.js
- Tạo file nếu còn thiếu: repositories/lecturer/exam-registration.repository.js
- Tạo file nếu còn thiếu: views/lecturer/pages/exam-registration.pug
- Chỉnh sửa stored procedure: sp_DangKyThi
- Bổ sung stored procedure: sp_SuaDangKyThi, sp_XoaDangKyThi
- Bổ sung validate: trình độ, lần, số câu, ngày giờ, thời lượng
- Bổ sung kiểm tra: 70%/30%, trùng khóa, chồng lịch, khóa sửa/xóa
- Bổ sung kiểm tra quyền: PGV/GIANGVIEN/SINHVIEN và chủ sở hữu MAGV
- Kiểm tra không ảnh hưởng module: 4.5, 4.7, 4.8, 4.9
```

Nếu có sửa database Docker thật, phải nêu rõ đã đồng bộ lại vào file `THITRACNGHIEM.sql` hay chưa.

---

## 14. Rule về phần có thể mở rộng và phần chưa làm

Các chức năng mở rộng không được tự ý triển khai nếu chưa có yêu cầu rõ ràng.

Các phần mở rộng có thể gồm:

* Audit log thao tác.
* Soft delete.
* Versioning dữ liệu.
* Thống kê nâng cao.
* Tìm kiếm nâng cao.
* Export file.
* Import file.
* Phân quyền chi tiết hơn.
* Tối ưu hiệu năng bằng index mới.
* Thay đổi UI lớn.
* Thay đổi database lớn.
* Cho PGV đăng ký thay giảng viên và chọn `MAGV` theo quy trình được phê duyệt.
* Lịch sử thay đổi cấu hình kỳ thi.

Sau khi hoàn thành module, phải liệt kê các phần mở rộng chưa triển khai để người dùng dễ theo dõi.

Mẫu liệt kê:

```text
Chưa triển khai vì thuộc phần mở rộng:
- Audit log và lịch sử thay đổi đăng ký.
- Cho PGV đăng ký thay giảng viên.
- Thống kê, export/import và tìm kiếm nâng cao.
```

Nếu phần mở rộng nào cần thay đổi database, phải ghi rõ rằng phần đó cần thêm bảng, thêm cột hoặc thay đổi luồng xử lý.

Nếu muốn triển khai các phần mở rộng này, phải hỏi lại người dùng trước.

---

## 15. Rule bắt buộc trước khi bắt đầu code

Trước khi sinh code, phải xác nhận đã có đủ các phần sau:

* Phân tích nghiệp vụ.
* Workflow / pipeline.
* Ranh giới module.
* Database liên quan.
* Phân quyền.
* API / route cần có.
* Cấu trúc file cần sửa.
* Stored procedure / query cần dùng.
* Rule validate dữ liệu.
* Case test chính.

Nếu thiếu các phần trên, không được tự ý đoán toàn bộ. Phải nêu rõ phần còn thiếu hoặc chỉ triển khai trong phạm vi đã chắc chắn.

Riêng module 4.6, trước khi code phải xác nhận thêm:

* Schema và khóa chính của `GIAOVIEN_DANGKY`.
* Các object hiện có phải kiểm tra trước: `sp_GetLop`, `sp_GetMonHoc`, `sp_CheckDuSoCauThi`, `sp_DangKyThi`, `vw_LichThi`.
* Tên procedure sửa/xóa đã chốt là `sp_SuaDangKyThi` và `sp_XoaDangKyThi`; nếu chưa tồn tại thì tạo đúng tên này, không đặt biến thể khác.
* Quy tắc đủ câu 70%/30%, không lọc theo `BODE.MAGV`.
* Quy tắc trùng khóa, chồng lịch và khóa sửa/xóa sau khi phát sinh bài thi hoặc điểm.
* Các file hiện có phải ưu tiên sửa: `controllers/admin/exam-registration.controller.js`, `views/admin/pages/exam-registration.pug`, `routes/admin/index.route.js`, `controllers/lecturer/index.controller.js`, `routes/lecturer/index.route.js`, `views/lecturer/partials/sider.pug` và các asset dùng chung liên quan.
