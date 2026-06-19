USE [THITRACNGHIEM];
GO

SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.BODE WHERE CAUHOI = 372)
       AND NOT EXISTS (SELECT 1 FROM dbo.BODE WHERE CAUHOI = 222)
    BEGIN
        INSERT INTO dbo.BODE
        (CAUHOI, MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV)
        SELECT 222, MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV
        FROM dbo.BODE
        WHERE CAUHOI = 372;

        UPDATE dbo.BAITHI_CHITIET
        SET CAUHOI = 222
        WHERE CAUHOI = 372;

        DELETE FROM dbo.BODE
        WHERE CAUHOI = 372;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ThemCauHoi
    @MAMH NCHAR(5),
    @TRINHDO CHAR(1),
    @NOIDUNG NVARCHAR(500),
    @A NVARCHAR(200),
    @B NVARCHAR(200),
    @C NVARCHAR(200),
    @D NVARCHAR(200),
    @DAP_AN CHAR(1),
    @MAGV NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @CAUHOI INT,
            @KETQUA_KHOA INT;

    IF @MAMH IS NULL OR LEN(LTRIM(RTRIM(@MAMH))) = 0
       OR @TRINHDO IS NULL OR LEN(LTRIM(RTRIM(@TRINHDO))) = 0
       OR @NOIDUNG IS NULL OR LEN(LTRIM(RTRIM(@NOIDUNG))) = 0
       OR @A IS NULL OR LEN(LTRIM(RTRIM(@A))) = 0
       OR @B IS NULL OR LEN(LTRIM(RTRIM(@B))) = 0
       OR @C IS NULL OR LEN(LTRIM(RTRIM(@C))) = 0
       OR @D IS NULL OR LEN(LTRIM(RTRIM(@D))) = 0
       OR @DAP_AN IS NULL OR LEN(LTRIM(RTRIM(@DAP_AN))) = 0
       OR @MAGV IS NULL OR LEN(LTRIM(RTRIM(@MAGV))) = 0
    BEGIN
        RAISERROR(N'Không được lưu câu hỏi thiếu môn học, trình độ, nội dung, đáp án hoặc mã giảng viên.', 16, 1);
        RETURN;
    END;

    IF @TRINHDO NOT IN ('A', 'B', 'C')
    BEGIN
        RAISERROR(N'Trình độ không hợp lệ.', 16, 1);
        RETURN;
    END;

    IF @DAP_AN NOT IN ('A', 'B', 'C', 'D')
    BEGIN
        RAISERROR(N'Đáp án không hợp lệ.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.MONHOC WHERE RTRIM(MAMH) = RTRIM(@MAMH))
    BEGIN
        RAISERROR(N'Môn học không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.GIAOVIEN WHERE RTRIM(MAGV) = RTRIM(@MAGV))
    BEGIN
        RAISERROR(N'Giảng viên không tồn tại.', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        EXEC @KETQUA_KHOA = sys.sp_getapplock
            @Resource = N'BODE_CAUHOI_NUMBER',
            @LockMode = N'Exclusive',
            @LockOwner = N'Transaction',
            @LockTimeout = 10000;

        IF @KETQUA_KHOA < 0
            THROW 50001, N'Không thể cấp mã câu hỏi. Vui lòng thử lại.', 1;

        SELECT @CAUHOI = ISNULL(MAX(CAUHOI), 0) + 1
        FROM dbo.BODE WITH (UPDLOCK, HOLDLOCK);

        INSERT INTO dbo.BODE
        (CAUHOI, MAMH, TRINHDO, NOIDUNG, A, B, C, D, DAP_AN, MAGV)
        VALUES
        (@CAUHOI, @MAMH, @TRINHDO, @NOIDUNG, @A, @B, @C, @D, @DAP_AN, @MAGV);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;

    SELECT
        @CAUHOI AS CAUHOI,
        N'Thêm câu hỏi thành công.' AS ThongBao;
END;
GO

IF OBJECT_ID(N'dbo.SEQ_BODE_CAUHOI', N'SO') IS NOT NULL
    DROP SEQUENCE dbo.SEQ_BODE_CAUHOI;
GO
