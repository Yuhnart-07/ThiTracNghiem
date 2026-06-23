const { getPool, sql } = require("../../configs/database.config");

const mapLecturerWithoutAccount = (row) => ({
  maGiangVien: row.MAGV?.trim(),
  ho: row.HO?.trim(),
  ten: row.TEN?.trim(),
});

const mapAccount = (row) => ({
  id: row.ID,
  username: row.USERNAME?.trim(),
  role: row.ROLE?.trim(),
  isActive: row.IS_ACTIVE,
  maGiangVien: row.MAGV?.trim(),
  ho: row.HO?.trim(),
  ten: row.TEN?.trim(),
  sdt: row.SODTLL?.trim(),
  diaChi: row.DIACHI?.trim(),
});

const getLecturersWithoutAccount = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetGiangVienChuaCoTaiKhoan");
  return result.recordset.map(mapLecturerWithoutAccount);
};

const getAccounts = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetDanhSachTaiKhoan");
  return result.recordset.map(mapAccount);
};


const createAccount = async ({ username, password, role, maGiangVien }) => {
  const pool = getPool();
  // For PGV role, DB constraint requires MAGV to be NULL
  const finalMaGV = role === "PGV" ? null : maGiangVien;
  const result = await pool
    .request()
    .input("USERNAME", sql.NVarChar(50), username)
    .input("PASSWORD_HASH", sql.NVarChar(255), password)
    .input("ROLE", sql.VarChar(20), role)
    .input("MAGV", sql.NVarChar(50), finalMaGV)
    .execute("sp_ThemTaiKhoan");
  return result.recordset ? result.recordset[0] : null;
};

const updateAccount = async ({ id, password, role }) => {
  const pool = getPool();
  const request = pool.request()
    .input("ID", sql.Int, id)
    .input("ROLE", sql.VarChar(20), role);
  if (password) {
    request.input("PASSWORD_HASH", sql.NVarChar(255), password);
  } else {
    request.input("PASSWORD_HASH", sql.NVarChar(255), null);
  }
  const result = await request.execute("sp_SuaTaiKhoan");
  return result.recordset ? result.recordset[0] : null;
};

const deleteAccount = async (id) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("ID", sql.Int, Number(id))
    .execute("sp_XoaTaiKhoan");
  return result.recordset ? result.recordset[0] : null;
};

const deleteMultipleAccounts = async (idsString) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachID", sql.NVarChar(sql.MAX), idsString)
    .execute("sp_XoaNhieuTaiKhoan");
  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getLecturersWithoutAccount,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  deleteMultipleAccounts,
};
