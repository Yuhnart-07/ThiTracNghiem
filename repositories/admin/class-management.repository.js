const { getPool, sql } = require("../../configs/database.config");

const mapLop = (row) => ({
  maLop: row.MALOP?.trim(),
  tenLop: row.TENLOP?.trim(),
  soSinhVien: row.SOSV || 0,
});

const mapSinhVien = (row) => ({
  maSinhVien: row.MASV?.trim(),
  ho: row.HO?.trim(),
  ten: row.TEN?.trim(),
  ngaySinh: row.NGAYSINH,
  diaChi: row.DIACHI?.trim(),
  maLop: row.MALOP?.trim(),
  tenLop: row.TENLOP?.trim(),
});

// 1. Lấy danh sách lớp
const getDanhSachLop = async () => {
  const pool = getPool();
  const result = await pool.request().execute("sp_GetDanhSachLop");
  return result.recordset.map(mapLop);
};

// 2. Lấy danh sách sinh viên theo lớp
const getSinhVienByLop = async (maLop) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MALOP", sql.NVarChar(50), maLop)
    .execute("sp_GetSinhVienByLop");
  return result.recordset.map(mapSinhVien);
};

// 3. Thêm sinh viên
const themSinhVien = async ({ maSinhVien, ho, ten, ngaySinh, diaChi, maLop }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MASV", sql.NVarChar(50), maSinhVien)
    .input("HO", sql.NVarChar(40), ho)
    .input("TEN", sql.NVarChar(10), ten)
    .input("NGAYSINH", sql.Date, ngaySinh ? new Date(ngaySinh) : null)
    .input("DIACHI", sql.NVarChar(100), diaChi)
    .input("MALOP", sql.NVarChar(50), maLop)
    .execute("sp_ThemSinhVien");
  return result.recordset ? result.recordset[0] : null;
};

// 4. Sửa sinh viên
const suaSinhVien = async ({ maSinhVien, ho, ten, ngaySinh, diaChi }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MASV", sql.NVarChar(50), maSinhVien)
    .input("HO", sql.NVarChar(40), ho)
    .input("TEN", sql.NVarChar(10), ten)
    .input("NGAYSINH", sql.Date, ngaySinh ? new Date(ngaySinh) : null)
    .input("DIACHI", sql.NVarChar(100), diaChi)
    .execute("sp_SuaSinhVien");
  return result.recordset ? result.recordset[0] : null;
};

// 5. Xóa sinh viên
const xoaSinhVien = async (maSinhVien) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MASV", sql.NVarChar(50), maSinhVien)
    .execute("sp_XoaSinhVien");
  return result.recordset ? result.recordset[0] : null;
};

// 6. Thêm lớp
const themLop = async ({ maLop, tenLop }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MALOP", sql.NVarChar(50), maLop)
    .input("TENLOP", sql.NVarChar(40), tenLop)
    .execute("sp_ThemLop");
  return result.recordset ? result.recordset[0] : null;
};

// 7. Sửa lớp
const suaLop = async ({ maLop, tenLop }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MALOP", sql.NVarChar(50), maLop)
    .input("TENLOP", sql.NVarChar(40), tenLop)
    .execute("sp_SuaLop");
  return result.recordset ? result.recordset[0] : null;
};

// 8. Xóa lớp
const xoaLop = async (maLop) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MALOP", sql.NVarChar(50), maLop)
    .execute("sp_XoaLop");
  return result.recordset ? result.recordset[0] : null;
};

// 9. Xóa nhiều lớp
const xoaNhieuLop = async (danhSachMaLop) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachMALOP", sql.NVarChar(sql.MAX), danhSachMaLop)
    .execute("sp_XoaNhieuLop");
  return result.recordset ? result.recordset[0] : null;
};

// 10. Xóa nhiều sinh viên
const xoaNhieuSinhVien = async (danhSachMaSV) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("DanhSachMASV", sql.NVarChar(sql.MAX), danhSachMaSV)
    .execute("sp_XoaNhieuSinhVien");
  return result.recordset ? result.recordset[0] : null;
};

module.exports = {
  getDanhSachLop,
  getSinhVienByLop,
  themSinhVien,
  suaSinhVien,
  xoaSinhVien,
  themLop,
  suaLop,
  xoaLop,
  xoaNhieuLop,
  xoaNhieuSinhVien,
};

