const { getPool, sql } = require("../../configs/database.config");

const mapSubject = (row) => ({
  maMonHoc: row.MAMH?.trim(),
  tenMonHoc: row.TENMH?.trim(),
});

const getSubjects = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetMonHoc");
  return result.recordset.map(mapSubject);
};

const createSubject = async ({ maMonHoc, tenMonHoc }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), maMonHoc)
    .input("TENMH", sql.NVarChar(40), tenMonHoc)
    .execute("sp_ThemMonHoc");
  return result.recordset ? result.recordset[0] : null;
};

const updateSubject = async ({ maMonHoc, tenMonHoc }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), maMonHoc)
    .input("TENMH", sql.NVarChar(40), tenMonHoc)
    .execute("sp_SuaMonHoc");
  return result.recordset ? result.recordset[0] : null;
};

const deleteSubject = async (maMonHoc) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), maMonHoc)
    .execute("sp_XoaMonHoc");
  return result.recordset ? result.recordset[0] : null;
};

const deleteMultipleSubjects = async (idsString) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachMAMH", sql.NVarChar(sql.MAX), idsString)
    .execute("sp_XoaNhieuMonHoc");
  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  deleteMultipleSubjects,
};
