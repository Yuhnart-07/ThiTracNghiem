const { getPool, sql } = require("../../configs/database.config");

const mapLecturer = (row) => ({
  maGiangVien: row.MAGV?.trim(),
  ho: row.HO?.trim(),
  ten: row.TEN?.trim(),
  diaChi: row.DIACHI?.trim(),
  sdt: row.SODTLL?.trim(),
});

const getLecturers = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetGiangVien");
  return result.recordset.map(mapLecturer);
};

const createLecturer = async ({ maGiangVien, ho, ten, diaChi, sdt }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .input("HO", sql.NVarChar(50), ho)
    .input("TEN", sql.NVarChar(10), ten)
    .input("DIACHI", sql.NVarChar(50), diaChi)
    .input("SODTLL", sql.NVarChar(50), sdt)
    .execute("sp_ThemGiangVien");
  return result.recordset ? result.recordset[0] : null;
};

const updateLecturer = async ({ maGiangVien, ho, ten, diaChi, sdt }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .input("HO", sql.NVarChar(50), ho)
    .input("TEN", sql.NVarChar(10), ten)
    .input("DIACHI", sql.NVarChar(50), diaChi)
    .input("SODTLL", sql.NVarChar(50), sdt)
    .execute("sp_SuaGiangVien");
  return result.recordset ? result.recordset[0] : null;
};

const deleteLecturer = async (maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .execute("sp_XoaGiangVien");
  return result.recordset ? result.recordset[0] : null;
};

const deleteMultipleLecturers = async (idsString) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachMAGV", sql.NVarChar(sql.MAX), idsString)
    .execute("sp_XoaNhieuGiangVien");
  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
  deleteMultipleLecturers,
};
