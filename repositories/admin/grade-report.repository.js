const { getPool, sql } = require("../../configs/database.config");

const mapGrade = (row) => ({
  stt: row.STT,
  maSinhVien: row.MASV?.trim(),
  ho: row.HO?.trim(),
  ten: row.TEN?.trim(),
  diem: row.DIEM !== null && row.DIEM !== undefined ? Number(row.DIEM) : null,
  diemChu: row.DIEM_CHU?.trim(),
});

const getGradeReport = async ({ maLop, maMonHoc, lanThi }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MALOP", sql.NChar(15), maLop)
    .input("MAMH", sql.NChar(5), maMonHoc)
    .input("LAN", sql.SmallInt, Number(lanThi))
    .execute("sp_GetBangDiem");
  return result.recordset.map(mapGrade);
};

module.exports = {
  getGradeReport,
};
