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
  const result = await pool
    .request()
    .input("LGNAME", sql.NVarChar(128), username)
    .input("PASS", sql.NVarChar(128), password)
    .input("MAGV", sql.NVarChar(50), maGiangVien)
    .input("ROLE", sql.NVarChar(30), role)
    .execute("SP_TAOTAIKHOAN");

  const returnVal = result.returnValue;
  if (returnVal !== 0) {
    const errorMap = {
      1: "Tên đăng nhập không được để trống.",
      2: "Mật khẩu không được để trống.",
      3: "Mã giảng viên không được để trống và tối đa 8 ký tự.",
      4: "Nhóm quyền không hợp lệ.",
      5: "Mã giảng viên không tồn tại trong hệ thống.",
      6: "Tên đăng nhập đã tồn tại trên Server.",
      7: "Giảng viên này đã có tài khoản rồi.",
      8: "Nhóm quyền chưa được tạo trong SQL Server."
    };
    throw new Error(errorMap[returnVal] || "Có lỗi xảy ra khi tạo tài khoản.");
  }
  return { success: true };
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
