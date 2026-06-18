const { getPool, sql } = require("../../configs/database.config");

const mapRow = (row) => ({
  maGiangVien: row.MAGV?.trim(), hoTenGiangVien: `${row.HO_GV || ""} ${row.TEN_GV || ""}`.trim(),
  maLop: row.MALOP?.trim(), tenLop: row.TENLOP, maMonHoc: row.MAMH?.trim(), tenMonHoc: row.TENMH,
  trinhDo: row.TRINHDO?.trim(), ngayThi: row.NGAYTHI, lan: row.LAN, soCauThi: row.SOCAUTHI,
  thoiGian: row.THOIGIAN, daKhoa: Boolean(row.DA_KHOA),
});

const getReferenceData = async () => {
  const pool = getPool();
  const [classes, subjects] = await Promise.all([
    pool.request().execute("sp_GetLop"), pool.request().execute("sp_GetMonHoc"),
  ]);
  return {
    classes: classes.recordset.map((r) => ({ maLop: r.MALOP?.trim(), tenLop: r.TENLOP })),
    subjects: subjects.recordset.map((r) => ({ maMonHoc: r.MAMH?.trim(), tenMonHoc: r.TENMH })),
  };
};

const getRegistrations = async ({ maGiangVien, maLop, maMonHoc, trinhDo, keyword }) => {
  const result = await getPool().request()
    .input("MAGV", sql.NChar(8), maGiangVien || null).input("MALOP", sql.NChar(15), maLop || null)
    .input("MAMH", sql.NChar(5), maMonHoc || null).input("TRINHDO", sql.Char(1), trinhDo || null)
    .input("KEYWORD", sql.NVarChar(100), keyword || null).query(`
      SELECT l.*,
        CASE WHEN EXISTS (SELECT 1 FROM BAITHI b JOIN SINHVIEN s ON b.MASV=s.MASV WHERE RTRIM(s.MALOP)=RTRIM(l.MALOP) AND RTRIM(b.MAMH)=RTRIM(l.MAMH) AND b.LAN=l.LAN)
          OR EXISTS (SELECT 1 FROM BANGDIEM b JOIN SINHVIEN s ON b.MASV=s.MASV WHERE RTRIM(s.MALOP)=RTRIM(l.MALOP) AND RTRIM(b.MAMH)=RTRIM(l.MAMH) AND b.LAN=l.LAN) THEN 1 ELSE 0 END DA_KHOA
      FROM vw_LichThi l
      WHERE (@MAGV IS NULL OR RTRIM(l.MAGV)=RTRIM(@MAGV)) AND (@MALOP IS NULL OR RTRIM(l.MALOP)=RTRIM(@MALOP))
        AND (@MAMH IS NULL OR RTRIM(l.MAMH)=RTRIM(@MAMH)) AND (@TRINHDO IS NULL OR l.TRINHDO=@TRINHDO)
        AND (@KEYWORD IS NULL OR l.TENLOP LIKE N'%'+@KEYWORD+'%' OR l.TENMH LIKE N'%'+@KEYWORD+'%')
      ORDER BY l.NGAYTHI DESC`);
  return result.recordset.map(mapRow);
};

const checkQuestions = async (p) => (await getPool().request().input("MAMH",sql.NChar(5),p.maMonHoc).input("TRINHDO",sql.Char(1),p.trinhDo).input("SOCAUTHI",sql.SmallInt,p.soCauThi).execute("sp_CheckDuSoCauThi")).recordset[0];
const addInputs = (r,p) => r.input("MALOP",sql.NChar(15),p.maLop).input("MAMH",sql.NChar(5),p.maMonHoc).input("TRINHDO",sql.Char(1),p.trinhDo).input("NGAYTHI_TEXT",sql.VarChar(16),p.ngayThi).input("LAN",sql.SmallInt,p.lan).input("SOCAUTHI",sql.SmallInt,p.soCauThi).input("THOIGIAN",sql.SmallInt,p.thoiGian);
const createRegistration = async (p) => (await addInputs(getPool().request().input("MAGV",sql.NChar(8),p.maGiangVien),p).query("DECLARE @D DATETIME=TRY_CONVERT(DATETIME,@NGAYTHI_TEXT,126); EXEC sp_DangKyThi @MAGV,@MALOP,@MAMH,@TRINHDO,@D,@LAN,@SOCAUTHI,@THOIGIAN")).recordset[0];
const updateRegistration = async (old,p) => (await addInputs(getPool().request().input("MAGV",sql.NChar(8),p.maGiangVien).input("MAMH_CU",sql.NChar(5),old.maMonHoc).input("MALOP_CU",sql.NChar(15),old.maLop).input("LAN_CU",sql.SmallInt,old.lan),p).query("DECLARE @D DATETIME=TRY_CONVERT(DATETIME,@NGAYTHI_TEXT,126); EXEC sp_SuaDangKyThi @MAGV,@MAMH_CU,@MALOP_CU,@LAN_CU,@MAMH,@MALOP,@TRINHDO,@D,@LAN,@SOCAUTHI,@THOIGIAN")).recordset[0];
const deleteRegistration = async (k,magv) => (await getPool().request().input("MAGV",sql.NChar(8),magv).input("MAMH",sql.NChar(5),k.maMonHoc).input("MALOP",sql.NChar(15),k.maLop).input("LAN",sql.SmallInt,k.lan).execute("sp_XoaDangKyThi")).recordset[0];

module.exports={getReferenceData,getRegistrations,checkQuestions,createRegistration,updateRegistration,deleteRegistration};
