-- =========================================================================
-- SCRIPT TẠO STORED PROCEDURES CHO HỆ THỐNG THI TRẮC NGHIỆM
-- =========================================================================

-- 1. Login sinh viên (chỉ cần MASV)
IF OBJECT_ID('sp_LoginSinhVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_LoginSinhVien;
GO
CREATE PROCEDURE sp_LoginSinhVien
  @MASV NCHAR(8)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    sv.MASV,
    sv.HO,
    sv.TEN,
    sv.MALOP,
    l.TENLOP,
    'student' AS ROLE
  FROM SinhVien sv
  LEFT JOIN Lop l ON sv.MALOP = l.MALOP
  WHERE RTRIM(sv.MASV) = RTRIM(@MASV);
END;
GO

-- 2. Danh sách lớp (JOIN đếm số SV/lớp — tối ưu hóa truy vấn)
IF OBJECT_ID('sp_GetDanhSachLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetDanhSachLop;
GO
CREATE PROCEDURE sp_GetDanhSachLop
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    l.MALOP,
    l.TENLOP,
    COUNT(sv.MASV) AS SOSV
  FROM Lop l
  LEFT JOIN SinhVien sv ON l.MALOP = sv.MALOP
  GROUP BY l.MALOP, l.TENLOP;
END;
GO

-- 3. Lấy sinh viên theo lớp
IF OBJECT_ID('sp_GetSinhVienByLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetSinhVienByLop;
GO
CREATE PROCEDURE sp_GetSinhVienByLop
  @MALOP NCHAR(8)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    sv.MASV,
    sv.HO,
    sv.TEN,
    sv.NGAYSINH,
    sv.DIACHI,
    sv.MALOP,
    l.TENLOP
  FROM SinhVien sv
  INNER JOIN Lop l ON sv.MALOP = l.MALOP
  WHERE RTRIM(sv.MALOP) = RTRIM(@MALOP);
END;
GO

-- 4. Thêm sinh viên (MALOP tự gán từ lớp đang chọn)
IF OBJECT_ID('sp_ThemSinhVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemSinhVien;
GO
CREATE PROCEDURE sp_ThemSinhVien
  @MASV    NCHAR(8),
  @HO      NVARCHAR(40),
  @TEN     NVARCHAR(10),
  @NGAYSINH DATE,
  @DIACHI  NVARCHAR(100),
  @MALOP   NCHAR(8)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO SinhVien (MASV, HO, TEN, NGAYSINH, DIACHI, MALOP)
  VALUES (@MASV, @HO, @TEN, @NGAYSINH, @DIACHI, @MALOP);
END;
GO

-- 5. Sửa sinh viên
IF OBJECT_ID('sp_SuaSinhVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_SuaSinhVien;
GO
CREATE PROCEDURE sp_SuaSinhVien
  @MASV     NCHAR(8),
  @HO       NVARCHAR(40),
  @TEN      NVARCHAR(10),
  @NGAYSINH DATE,
  @DIACHI   NVARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE SinhVien
  SET
    HO       = @HO,
    TEN      = @TEN,
    NGAYSINH = @NGAYSINH,
    DIACHI   = @DIACHI
  WHERE RTRIM(MASV) = RTRIM(@MASV);
END;
GO

-- 6. Xóa sinh viên
IF OBJECT_ID('sp_XoaSinhVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaSinhVien;
GO
CREATE PROCEDURE sp_XoaSinhVien
  @MASV NCHAR(8)
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM SinhVien WHERE RTRIM(MASV) = RTRIM(@MASV);
END;
GO

-- 7. Thêm lớp
IF OBJECT_ID('sp_ThemLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemLop;
GO
CREATE PROCEDURE sp_ThemLop
  @MALOP  NCHAR(8),
  @TENLOP NVARCHAR(40)
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO Lop (MALOP, TENLOP) VALUES (@MALOP, @TENLOP);
END;
GO

-- 8. Sửa lớp
IF OBJECT_ID('sp_SuaLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_SuaLop;
GO
CREATE PROCEDURE sp_SuaLop
  @MALOP  NCHAR(8),
  @TENLOP NVARCHAR(40)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE Lop SET TENLOP = @TENLOP WHERE RTRIM(MALOP) = RTRIM(@MALOP);
END;
GO

-- 9. Xóa lớp (kiểm tra xem lớp có sinh viên không trước khi xóa)
IF OBJECT_ID('sp_XoaLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaLop;
GO
CREATE PROCEDURE sp_XoaLop
  @MALOP NCHAR(8)
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM SinhVien WHERE RTRIM(MALOP) = RTRIM(@MALOP))
  BEGIN
    RAISERROR(N'Không thể xóa lớp vì hiện đang có sinh viên học.', 16, 1);
    RETURN;
  END
  DELETE FROM Lop WHERE RTRIM(MALOP) = RTRIM(@MALOP);
END;
GO

-- 10. Xóa nhiều lớp (kiểm tra xem có lớp nào có sinh viên không trước khi xóa)
IF OBJECT_ID('sp_XoaNhieuLop', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuLop;
GO
CREATE PROCEDURE sp_XoaNhieuLop
  @DanhSachMALOP NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Kiểm tra xem có lớp nào trong danh sách xóa đang chứa sinh viên hay không
  IF EXISTS (
    SELECT 1 FROM SinhVien
    WHERE MALOP IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMALOP, ','))
  )
  BEGIN
    RAISERROR(N'Không thể xóa các lớp đang có chứa sinh viên học.', 16, 1);
    RETURN;
  END

  -- Tiến hành xóa các lớp hợp lệ
  DELETE FROM Lop
  WHERE MALOP IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMALOP, ','));
END;
GO

-- 11. Xóa nhiều sinh viên
IF OBJECT_ID('sp_XoaNhieuSinhVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuSinhVien;
GO
CREATE PROCEDURE sp_XoaNhieuSinhVien
  @DanhSachMASV NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM SinhVien
  WHERE MASV IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMASV, ','));
END;
GO

-- =============================================
-- MÔN HỌC
-- =============================================
IF OBJECT_ID('sp_ThemMonHoc', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemMonHoc;
GO
CREATE PROCEDURE sp_ThemMonHoc
  @MAMH NCHAR(5), @TENMH NVARCHAR(40)
AS
BEGIN
  INSERT INTO MONHOC (MAMH, TENMH) VALUES (@MAMH, @TENMH);
END;
GO

IF OBJECT_ID('sp_SuaMonHoc', 'P') IS NOT NULL
    DROP PROCEDURE sp_SuaMonHoc;
GO
CREATE PROCEDURE sp_SuaMonHoc
  @MAMH NCHAR(5), @TENMH NVARCHAR(40)
AS
BEGIN
  UPDATE MONHOC SET TENMH = @TENMH WHERE RTRIM(MAMH) = RTRIM(@MAMH);
END;
GO

IF OBJECT_ID('sp_XoaMonHoc', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaMonHoc;
GO
CREATE PROCEDURE sp_XoaMonHoc
  @MAMH NCHAR(5)
AS
BEGIN
  IF EXISTS (SELECT 1 FROM GIAOVIEN_DANGKY WHERE RTRIM(MAMH) = RTRIM(@MAMH)) OR EXISTS (SELECT 1 FROM BODE WHERE RTRIM(MAMH) = RTRIM(@MAMH))
  BEGIN
    RAISERROR(N'Không thể xóa môn học đã có đề thi hoặc lịch đăng ký.', 16, 1);
    RETURN;
  END
  DELETE FROM MONHOC WHERE RTRIM(MAMH) = RTRIM(@MAMH);
END;
GO

IF OBJECT_ID('sp_XoaNhieuMonHoc', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuMonHoc;
GO
CREATE PROCEDURE sp_XoaNhieuMonHoc
  @DanhSachMAMH NVARCHAR(MAX)
AS
BEGIN
  IF EXISTS (
    SELECT 1 FROM GIAOVIEN_DANGKY WHERE MAMH IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAMH, ','))
  ) OR EXISTS (
    SELECT 1 FROM BODE WHERE MAMH IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAMH, ','))
  )
  BEGIN
    RAISERROR(N'Không thể xóa các môn học đã có lịch đăng ký thi hoặc đã có câu hỏi trong bộ đề.', 16, 1);
    RETURN;
  END
  DELETE FROM MONHOC WHERE MAMH IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAMH, ','));
END;
GO

-- =============================================
-- GIẢNG VIÊN
-- =============================================
IF OBJECT_ID('sp_GetGiangVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetGiangVien;
GO
CREATE PROCEDURE sp_GetGiangVien
AS
BEGIN
  SELECT MAGV, HO, TEN, DIACHI, SODTLL FROM GIAOVIEN ORDER BY HO, TEN;
END;
GO

IF OBJECT_ID('sp_ThemGiangVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemGiangVien;
GO
CREATE PROCEDURE sp_ThemGiangVien
  @MAGV NCHAR(8), @HO NVARCHAR(50), @TEN NVARCHAR(10), @DIACHI NVARCHAR(50), @SODTLL NCHAR(15)
AS
BEGIN
  INSERT INTO GIAOVIEN (MAGV, HO, TEN, DIACHI, SODTLL) VALUES (@MAGV, @HO, @TEN, @DIACHI, @SODTLL);
END;
GO

IF OBJECT_ID('sp_SuaGiangVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_SuaGiangVien;
GO
CREATE PROCEDURE sp_SuaGiangVien
  @MAGV NCHAR(8), @HO NVARCHAR(50), @TEN NVARCHAR(10), @DIACHI NVARCHAR(50), @SODTLL NCHAR(15)
AS
BEGIN
  UPDATE GIAOVIEN SET HO = @HO, TEN = @TEN, DIACHI = @DIACHI, SODTLL = @SODTLL WHERE RTRIM(MAGV) = RTRIM(@MAGV);
END;
GO

IF OBJECT_ID('sp_XoaGiangVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaGiangVien;
GO
CREATE PROCEDURE sp_XoaGiangVien
  @MAGV NCHAR(8)
AS
BEGIN
  IF EXISTS (SELECT 1 FROM TAIKHOAN WHERE RTRIM(MAGV) = RTRIM(@MAGV)) OR EXISTS (SELECT 1 FROM GIAOVIEN_DANGKY WHERE RTRIM(MAGV) = RTRIM(@MAGV))
  BEGIN
    RAISERROR(N'Không thể xóa giảng viên đã có tài khoản hoặc có lịch đăng ký thi.', 16, 1);
    RETURN;
  END
  DELETE FROM GIAOVIEN WHERE RTRIM(MAGV) = RTRIM(@MAGV);
END;
GO

IF OBJECT_ID('sp_XoaNhieuGiangVien', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuGiangVien;
GO
CREATE PROCEDURE sp_XoaNhieuGiangVien
  @DanhSachMAGV NVARCHAR(MAX)
AS
BEGIN
  IF EXISTS (
    SELECT 1 FROM TAIKHOAN WHERE MAGV IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAGV, ','))
  ) OR EXISTS (
    SELECT 1 FROM GIAOVIEN_DANGKY WHERE MAGV IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAGV, ','))
  )
  BEGIN
    RAISERROR(N'Có giảng viên đã được cấp tài khoản hoặc đăng ký lịch thi, không thể xóa.', 16, 1);
    RETURN;
  END
  DELETE FROM GIAOVIEN WHERE MAGV IN (SELECT RTRIM(value) FROM STRING_SPLIT(@DanhSachMAGV, ','));
END;
GO

-- =============================================
-- BẢNG ĐIỂM
-- =============================================
IF OBJECT_ID('sp_GetBangDiem', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetBangDiem;
GO
CREATE PROCEDURE sp_GetBangDiem
  @MALOP NCHAR(15), @MAMH NCHAR(5), @LAN SMALLINT
AS
BEGIN
  SELECT 
    ROW_NUMBER() OVER (ORDER BY sv.HO, sv.TEN) AS STT,
    sv.MASV,
    sv.HO,
    sv.TEN,
    bd.DIEM,
    CASE 
      WHEN bd.DIEM >= 8.5 THEN 'A'
      WHEN bd.DIEM >= 7.0 THEN 'B'
      WHEN bd.DIEM >= 5.5 THEN 'C'
      WHEN bd.DIEM >= 4.0 THEN 'D'
      ELSE 'F'
    END AS DIEM_CHU
  FROM SinhVien sv
  INNER JOIN BangDiem bd ON sv.MASV = bd.MASV
  WHERE RTRIM(sv.MALOP) = RTRIM(@MALOP) AND RTRIM(bd.MAMH) = RTRIM(@MAMH) AND bd.LAN = @LAN;
END;
GO

-- =============================================
-- TÀI KHOẢN (ACCOUNT CREATE)
-- =============================================
IF OBJECT_ID('sp_GetGiangVienChuaCoTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetGiangVienChuaCoTaiKhoan;
GO
CREATE PROCEDURE sp_GetGiangVienChuaCoTaiKhoan
AS
BEGIN
  SELECT MAGV, HO, TEN FROM GIAOVIEN 
  WHERE MAGV NOT IN (SELECT MAGV FROM TAIKHOAN WHERE MAGV IS NOT NULL)
  ORDER BY HO, TEN;
END;
GO

IF OBJECT_ID('sp_GetDanhSachTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetDanhSachTaiKhoan;
GO
CREATE PROCEDURE sp_GetDanhSachTaiKhoan
AS
BEGIN
  SELECT 
    tk.ID, tk.USERNAME, tk.ROLE, tk.IS_ACTIVE,
    gv.MAGV, gv.HO, gv.TEN, gv.SODTLL, gv.DIACHI
  FROM TAIKHOAN tk
  INNER JOIN GIAOVIEN gv ON tk.MAGV = gv.MAGV
  ORDER BY tk.CREATED_AT DESC;
END;
GO

IF OBJECT_ID('sp_ThemTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemTaiKhoan;
GO
CREATE PROCEDURE sp_ThemTaiKhoan
  @USERNAME NVARCHAR(50), @PASSWORD_HASH NVARCHAR(255), @ROLE VARCHAR(20), @MAGV NCHAR(8)
AS
BEGIN
  INSERT INTO TAIKHOAN (USERNAME, PASSWORD_HASH, ROLE, MAGV, IS_ACTIVE, CREATED_AT)
  VALUES (@USERNAME, @PASSWORD_HASH, @ROLE, @MAGV, 1, GETDATE());
END;
GO

IF OBJECT_ID('sp_SuaTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_SuaTaiKhoan;
GO
CREATE PROCEDURE sp_SuaTaiKhoan
  @ID INT, @PASSWORD_HASH NVARCHAR(255) = NULL, @ROLE VARCHAR(20)
AS
BEGIN
  IF @PASSWORD_HASH IS NOT NULL
  BEGIN
    UPDATE TAIKHOAN SET PASSWORD_HASH = @PASSWORD_HASH, ROLE = @ROLE WHERE ID = @ID;
  END
  ELSE
  BEGIN
    UPDATE TAIKHOAN SET ROLE = @ROLE WHERE ID = @ID;
  END
END;
GO

IF OBJECT_ID('sp_XoaTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaTaiKhoan;
GO
CREATE PROCEDURE sp_XoaTaiKhoan
  @ID INT
AS
BEGIN
  DELETE FROM TAIKHOAN WHERE ID = @ID;
END;
GO

IF OBJECT_ID('sp_XoaNhieuTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuTaiKhoan;
GO
CREATE PROCEDURE sp_XoaNhieuTaiKhoan
  @DanhSachID NVARCHAR(MAX)
AS
BEGIN
  DELETE FROM TAIKHOAN WHERE ID IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@DanhSachID, ','));
END;
GO

-- =============================================
-- LẤY DANH SÁCH CÂU HỎI THI
-- =============================================
IF OBJECT_ID('sp_GetDanhSachCauHoi', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetDanhSachCauHoi;
GO
CREATE PROCEDURE sp_GetDanhSachCauHoi
  @MAGV NVARCHAR(50) = NULL,
  @MAMH NVARCHAR(50) = NULL,
  @TRINHDO CHAR(1) = NULL,
  @KEYWORD NVARCHAR(500) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    ch.CAUHOI,
    ch.MAMH,
    ch.TENMH,
    ch.TRINHDO,
    ch.NOIDUNG,
    ch.A,
    ch.B,
    ch.C,
    ch.D,
    ch.DAP_AN,
    ch.MAGV,
    ch.HO_GV,
    ch.TEN_GV,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM BAITHI_CHITIET ct
        WHERE ct.CAUHOI = ch.CAUHOI
      ) THEN 1
      ELSE 0
    END AS DA_SU_DUNG
  FROM vw_CauHoi ch
  WHERE (@MAGV IS NULL OR RTRIM(ch.MAGV) = RTRIM(@MAGV))
    AND (@MAMH IS NULL OR RTRIM(ch.MAMH) = RTRIM(@MAMH))
    AND (@TRINHDO IS NULL OR RTRIM(ch.TRINHDO) = RTRIM(@TRINHDO))
    AND (@KEYWORD IS NULL OR ch.NOIDUNG LIKE N'%' + @KEYWORD + N'%')
  ORDER BY ch.CAUHOI DESC;
END;
GO

-- =============================================
-- LẤY CHI TIẾT CÂU HỎI THEO ID
-- =============================================
IF OBJECT_ID('sp_GetCauHoiById', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetCauHoiById;
GO
CREATE PROCEDURE sp_GetCauHoiById
  @CAUHOI INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    ch.CAUHOI,
    ch.MAMH,
    ch.TENMH,
    ch.TRINHDO,
    ch.NOIDUNG,
    ch.A,
    ch.B,
    ch.C,
    ch.D,
    ch.DAP_AN,
    ch.MAGV,
    ch.HO_GV,
    ch.TEN_GV,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM BAITHI_CHITIET ct
        WHERE ct.CAUHOI = ch.CAUHOI
      ) THEN 1
      ELSE 0
    END AS DA_SU_DUNG
  FROM vw_CauHoi ch
  WHERE ch.CAUHOI = @CAUHOI;
END;
GO

-- =============================================
-- CÁC THỦ TỤC KIỂM TRA SỰ TỒN TẠI VÀ RÀNG BUỘC
-- =============================================
IF OBJECT_ID('sp_CheckSubjectExists', 'P') IS NOT NULL
    DROP PROCEDURE sp_CheckSubjectExists;
GO
CREATE PROCEDURE sp_CheckSubjectExists
  @MAMH NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM MONHOC WHERE RTRIM(MAMH) = RTRIM(@MAMH))
    SELECT 1 AS TonTai;
  ELSE
    SELECT 0 AS TonTai;
END;
GO

IF OBJECT_ID('sp_CheckTeacherExists', 'P') IS NOT NULL
    DROP PROCEDURE sp_CheckTeacherExists;
GO
CREATE PROCEDURE sp_CheckTeacherExists
  @MAGV NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM GIAOVIEN WHERE RTRIM(MAGV) = RTRIM(@MAGV))
    SELECT 1 AS TonTai;
  ELSE
    SELECT 0 AS TonTai;
END;
GO

IF OBJECT_ID('sp_CheckQuestionUsed', 'P') IS NOT NULL
    DROP PROCEDURE sp_CheckQuestionUsed;
GO
CREATE PROCEDURE sp_CheckQuestionUsed
  @CAUHOI INT
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM BAITHI_CHITIET WHERE CAUHOI = @CAUHOI)
    SELECT 1 AS DaSuDung;
  ELSE
    SELECT 0 AS DaSuDung;
END;
GO

-- =============================================
-- XÓA NHIỀU CÂU HỎI
-- =============================================
IF OBJECT_ID('sp_XoaNhieuCauHoi', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNhieuCauHoi;
GO
CREATE PROCEDURE sp_XoaNhieuCauHoi
  @DanhSachCAUHOI NVARCHAR(MAX),
  @MAGV NVARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;

  IF @DanhSachCAUHOI IS NULL OR @MAGV IS NULL OR LEN(LTRIM(RTRIM(@MAGV))) = 0
  BEGIN
    RAISERROR(N'Thiếu danh sách câu hỏi hoặc mã giảng viên.', 16, 1);
    RETURN;
  END

  IF EXISTS (
    SELECT 1 FROM BODE
    WHERE CAUHOI IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@DanhSachCAUHOI, ','))
      AND RTRIM(MAGV) <> RTRIM(@MAGV)
  )
  BEGIN
    RAISERROR(N'Có câu hỏi không thuộc sở hữu của bạn, không thể xóa.', 16, 1);
    RETURN;
  END

  IF EXISTS (
    SELECT 1 FROM BAITHI_CHITIET
    WHERE CAUHOI IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@DanhSachCAUHOI, ','))
  )
  BEGIN
    RAISERROR(N'Có câu hỏi đã được sử dụng trong bài thi nên không thể xóa.', 16, 1);
    RETURN;
  END

  DELETE FROM BODE
  WHERE CAUHOI IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@DanhSachCAUHOI, ','))
    AND RTRIM(MAGV) = RTRIM(@MAGV);
END;
GO

-- =============================================
-- LẤY DANH SÁCH ĐĂNG KÝ THI (LỊCH THI)
-- =============================================
IF OBJECT_ID('sp_GetDanhSachDangKyThi', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetDanhSachDangKyThi;
GO
CREATE PROCEDURE sp_GetDanhSachDangKyThi
  @MAGV NVARCHAR(50) = NULL,
  @MALOP NVARCHAR(50) = NULL,
  @MAMH NVARCHAR(50) = NULL,
  @TRINHDO CHAR(1) = NULL,
  @KEYWORD NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT l.*,
    CASE WHEN EXISTS (SELECT 1 FROM BAITHI b JOIN SINHVIEN s ON b.MASV=s.MASV WHERE RTRIM(s.MALOP)=RTRIM(l.MALOP) AND RTRIM(b.MAMH)=RTRIM(l.MAMH) AND b.LAN=l.LAN)
      OR EXISTS (SELECT 1 FROM BANGDIEM b JOIN SINHVIEN s ON b.MASV=s.MASV WHERE RTRIM(s.MALOP)=RTRIM(l.MALOP) AND RTRIM(b.MAMH)=RTRIM(l.MAMH) AND b.LAN=l.LAN) THEN 1 ELSE 0 END AS DA_KHOA
  FROM vw_LichThi l
  WHERE (@MAGV IS NULL OR RTRIM(l.MAGV)=RTRIM(@MAGV)) AND (@MALOP IS NULL OR RTRIM(l.MALOP)=RTRIM(@MALOP))
    AND (@MAMH IS NULL OR RTRIM(l.MAMH)=RTRIM(@MAMH)) AND (@TRINHDO IS NULL OR l.TRINHDO=@TRINHDO)
    AND (@KEYWORD IS NULL OR l.TENLOP LIKE N'%'+@KEYWORD+'%' OR l.TENMH LIKE N'%'+@KEYWORD+'%')
  ORDER BY l.NGAYTHI DESC;
END;
GO



