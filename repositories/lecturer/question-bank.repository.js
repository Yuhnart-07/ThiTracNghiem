const { getPool, sql } = require("../../configs/database.config");

const trimQuestionRow = (row) => ({
  cauHoi: row.CAUHOI,
  maMonHoc: row.MAMH?.trim(),
  tenMonHoc: row.TENMH,
  trinhDo: row.TRINHDO?.trim(),
  noiDung: row.NOIDUNG,
  dapAnA: row.A,
  dapAnB: row.B,
  dapAnC: row.C,
  dapAnD: row.D,
  dapAnDung: row.DAP_AN?.trim(),
  maGiangVien: row.MAGV?.trim(),
  hoGiangVien: row.HO_GV,
  tenGiangVien: row.TEN_GV,
  daSuDung: Boolean(row.DA_SU_DUNG),
});

const getSubjects = async () => {
  const pool = getPool();
  const result = await pool.request().query(`
    SELECT MAMH, TENMH
    FROM MONHOC
    ORDER BY TENMH
  `);

  return result.recordset.map((row) => ({
    maMonHoc: row.MAMH?.trim(),
    tenMonHoc: row.TENMH,
  }));
};

const getQuestions = async ({ maGiangVien, maMonHoc, trinhDo, keyword }) => {
  const pool = getPool();
  const request = pool.request();

  request.input("MAGV", sql.NChar(8), maGiangVien || null);
  request.input("MAMH", sql.NChar(5), maMonHoc || null);
  request.input("TRINHDO", sql.Char(1), trinhDo || null);
  request.input("KEYWORD", sql.NVarChar(500), keyword || null);

  const result = await request.query(`
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
    ORDER BY ch.CAUHOI DESC
  `);

  return result.recordset.map(trimQuestionRow);
};

const getQuestionById = async (questionId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .query(`
      SELECT TOP 1
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
      WHERE ch.CAUHOI = @CAUHOI
    `);

  return result.recordset[0] ? trimQuestionRow(result.recordset[0]) : null;
};

const checkSubjectExists = async (maMonHoc) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NChar(5), maMonHoc)
    .query("SELECT 1 AS TonTai FROM MONHOC WHERE RTRIM(MAMH) = RTRIM(@MAMH)");

  return result.recordset.length > 0;
};

const checkTeacherExists = async (maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAGV", sql.NChar(8), maGiangVien)
    .query("SELECT 1 AS TonTai FROM GIAOVIEN WHERE RTRIM(MAGV) = RTRIM(@MAGV)");

  return result.recordset.length > 0;
};

const checkQuestionUsedInExamDetail = async (questionId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .query("SELECT 1 AS DaSuDung FROM BAITHI_CHITIET WHERE CAUHOI = @CAUHOI");

  return result.recordset.length > 0;
};

const createQuestion = async (payload) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MAMH", sql.NChar(5), payload.maMonHoc)
    .input("TRINHDO", sql.Char(1), payload.trinhDo)
    .input("NOIDUNG", sql.NVarChar(500), payload.noiDung)
    .input("A", sql.NVarChar(200), payload.dapAnA)
    .input("B", sql.NVarChar(200), payload.dapAnB)
    .input("C", sql.NVarChar(200), payload.dapAnC)
    .input("D", sql.NVarChar(200), payload.dapAnD)
    .input("DAP_AN", sql.Char(1), payload.dapAnDung)
    .input("MAGV", sql.NChar(8), payload.maGiangVien)
    .execute("sp_ThemCauHoi");

  return result.recordset[0];
};

const updateQuestion = async (questionId, payload) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .input("MAMH", sql.NChar(5), payload.maMonHoc)
    .input("TRINHDO", sql.Char(1), payload.trinhDo)
    .input("NOIDUNG", sql.NVarChar(500), payload.noiDung)
    .input("A", sql.NVarChar(200), payload.dapAnA)
    .input("B", sql.NVarChar(200), payload.dapAnB)
    .input("C", sql.NVarChar(200), payload.dapAnC)
    .input("D", sql.NVarChar(200), payload.dapAnD)
    .input("DAP_AN", sql.Char(1), payload.dapAnDung)
    .input("MAGV", sql.NChar(8), payload.maGiangVien)
    .execute("sp_SuaCauHoi");

  return result.recordset[0];
};

const deleteQuestion = async (questionId, maGiangVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("CAUHOI", sql.Int, questionId)
    .input("MAGV", sql.NChar(8), maGiangVien)
    .execute("sp_XoaCauHoi");

  return result.recordset[0];
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
};
