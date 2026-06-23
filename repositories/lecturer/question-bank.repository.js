const { getPool, sql } = require("../../configs/database.config");

const trimQuestionRow = (row) => ({
  cauHoi: row.CAUHOI,
  maMonHoc: row.MAMH?.trim(),
  tenMonHoc: row.TENMH?.trim(),
  trinhDo: row.TRINHDO?.trim(),
  noiDung: row.NOIDUNG?.trim(),
  dapAnA: row.A?.trim(),
  dapAnB: row.B?.trim(),
  dapAnC: row.C?.trim(),
  dapAnD: row.D?.trim(),
  dapAnDung: row.DAP_AN?.trim(),
  maGiangVien: row.MAGV?.trim(),
  hoGiangVien: row.HO_GV?.trim(),
  tenGiangVien: row.TEN_GV?.trim(),
  daSuDung: Boolean(row.DA_SU_DUNG),
});

const getSubjects = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetMonHoc");
  return result.recordset.map((row) => ({
    maMonHoc: row.MAMH?.trim(),
    tenMonHoc: row.TENMH?.trim(),
  }));
};

const getQuestions = async ({ maGiangVien, maMonHoc, trinhDo, keyword }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien || null)
    .input("MAMH", sql.NVarChar(50), maMonHoc || null)
    .input("TRINHDO", sql.Char(1), trinhDo || null)
    .input("KEYWORD", sql.NVarChar(500), keyword || null)
    .execute("sp_GetDanhSachCauHoi");

  return result.recordset.map(trimQuestionRow);
};

const getQuestionById = async (questionId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .execute("sp_GetCauHoiById");

  return result.recordset[0] ? trimQuestionRow(result.recordset[0]) : null;
};

const checkSubjectExists = async (maMonHoc) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), maMonHoc)
    .execute("sp_CheckSubjectExists");

  return result.recordset[0]?.TonTai === 1;
};

const checkTeacherExists = async (maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .execute("sp_CheckTeacherExists");

  return result.recordset[0]?.TonTai === 1;
};

const checkQuestionUsedInExamDetail = async (questionId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .execute("sp_CheckQuestionUsed");

  return result.recordset[0]?.DaSuDung === 1;
};

const createQuestion = async (payload) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NVarChar(50), payload.maMonHoc)
    .input("TRINHDO", sql.Char(1), payload.trinhDo)
    .input("NOIDUNG", sql.NVarChar(500), payload.noiDung)
    .input("A", sql.NVarChar(200), payload.dapAnA)
    .input("B", sql.NVarChar(200), payload.dapAnB)
    .input("C", sql.NVarChar(200), payload.dapAnC)
    .input("D", sql.NVarChar(200), payload.dapAnD)
    .input("DAP_AN", sql.Char(1), payload.dapAnDung)
    .input("MAGV", sql.NVarChar(50), payload.maGiangVien)
    .execute("sp_ThemCauHoi");

  return result.recordset[0];
};

const updateQuestion = async (questionId, payload) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .input("MAMH", sql.NVarChar(50), payload.maMonHoc)
    .input("TRINHDO", sql.Char(1), payload.trinhDo)
    .input("NOIDUNG", sql.NVarChar(500), payload.noiDung)
    .input("A", sql.NVarChar(200), payload.dapAnA)
    .input("B", sql.NVarChar(200), payload.dapAnB)
    .input("C", sql.NVarChar(200), payload.dapAnC)
    .input("D", sql.NVarChar(200), payload.dapAnD)
    .input("DAP_AN", sql.Char(1), payload.dapAnDung)
    .input("MAGV", sql.NVarChar(50), payload.maGiangVien)
    .execute("sp_SuaCauHoi");

  return result.recordset[0];
};

const deleteQuestion = async (questionId, maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .execute("sp_XoaCauHoi");

  return result.recordset[0];
};

const deleteMultipleQuestions = async (idsString, maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachCAUHOI", sql.NVarChar(sql.MAX), idsString)
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .execute("sp_XoaNhieuCauHoi");

  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getSubjects,
  getQuestions,
  getQuestionById,
  checkSubjectExists,
  checkTeacherExists,
  checkQuestionUsedInExamDetail,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteMultipleQuestions,
};
