const { getPool, sql } = require("../../configs/database.config");

const loginLecturerAdmin = async ({ username, password }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("USERNAME", sql.NVarChar(50), username)
    .input("PASSWORD", sql.NVarChar(255), password)
    .execute("sp_LoginGiangVienAdmin");

  return result.recordset[0] || null;
};

module.exports = {
  loginLecturerAdmin,
};
