const { getPool, sql } = require("../../configs/database.config");

const mapRow = (row) => ({
  maGiangVien: row.MAGV?.trim(),
  hoTenGiangVien: `${row.HO_GV || ""} ${row.TEN_GV || ""}`.trim(),
  maLop: row.MALOP?.trim(),
  tenLop: row.TENLOP?.trim(),
  maMonHoc: row.MAMH?.trim(),
  tenMonHoc: row.TENMH?.trim(),
  trinhDo: row.TRINHDO?.trim(),
  ngayThi: row.NGAYTHI,
  lan: row.LAN,
  soCauThi: row.SOCAUTHI,
  thoiGian: row.THOIGIAN,
  daKhoa: Boolean(row.DA_KHOA),
});

const getReferenceData = async () => {
  const pool = getPool();
  const [classes, subjects] = await Promise.all([
    pool.request().execute("sp_GetLop"),
    pool.request().execute("sp_GetMonHoc"),
  ]);
  return {
    classes: classes.recordset.map((r) => ({
      maLop: r.MALOP?.trim(),
      tenLop: r.TENLOP?.trim(),
    })),
    subjects: subjects.recordset.map((r) => ({
      maMonHoc: r.MAMH?.trim(),
      tenMonHoc: r.TENMH?.trim(),
    })),
  };
};

const getRegistrations = async ({ maGiangVien, maLop, maMonHoc, trinhDo, keyword }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien || null)
    .input("MALOP", sql.NVarChar(50), maLop || null)
    .input("MAMH", sql.NVarChar(50), maMonHoc || null)
    .input("TRINHDO", sql.Char(1), trinhDo || null)
    .input("KEYWORD", sql.NVarChar(100), keyword || null)
    .execute("sp_GetDanhSachDangKyThi");

  return result.recordset.map(mapRow);
};

const checkQuestions = async (p) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), p.maMonHoc)
    .input("TRINHDO", sql.Char(1), p.trinhDo)
    .input("SOCAUTHI", sql.SmallInt, p.soCauThi)
    .execute("sp_CheckDuSoCauThi");

  return result.recordset[0];
};

const createRegistration = async (p) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), p.maGiangVien)
    .input("MALOP", sql.NVarChar(50), p.maLop)
    .input("MAMH", sql.NVarChar(50), p.maMonHoc)
    .input("TRINHDO", sql.Char(1), p.trinhDo)
    .input("NGAYTHI", sql.DateTime, p.ngayThi ? new Date(p.ngayThi) : null)
    .input("LAN", sql.SmallInt, p.lan)
    .input("SOCAUTHI", sql.SmallInt, p.soCauThi)
    .input("THOIGIAN", sql.SmallInt, p.thoiGian)
    .execute("sp_DangKyThi");

  return result.recordset ? result.recordset[0] : null;
};

const updateRegistration = async (old, p) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), p.maGiangVien)
    .input("MAMH_CU", sql.NVarChar(50), old.maMonHoc)
    .input("MALOP_CU", sql.NVarChar(50), old.maLop)
    .input("LAN_CU", sql.SmallInt, old.lan)
    .input("MAMH", sql.NVarChar(50), p.maMonHoc)
    .input("MALOP", sql.NVarChar(50), p.maLop)
    .input("TRINHDO", sql.Char(1), p.trinhDo)
    .input("NGAYTHI", sql.DateTime, p.ngayThi ? new Date(p.ngayThi) : null)
    .input("LAN", sql.SmallInt, p.lan)
    .input("SOCAUTHI", sql.SmallInt, p.soCauThi)
    .input("THOIGIAN", sql.SmallInt, p.thoiGian)
    .execute("sp_SuaDangKyThi");

  return result.recordset ? result.recordset[0] : null;
};

const deleteRegistration = async (k, magv) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), magv)
    .input("MAMH", sql.NVarChar(50), k.maMonHoc)
    .input("MALOP", sql.NVarChar(50), k.maLop)
    .input("LAN", sql.SmallInt, k.lan)
    .execute("sp_XoaDangKyThi");

  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getReferenceData,
  getRegistrations,
  checkQuestions,
  createRegistration,
  updateRegistration,
  deleteRegistration,
};
