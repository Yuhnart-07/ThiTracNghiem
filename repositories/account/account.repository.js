const { getPool, sql } = require("../../configs/database.config");

const loginLecturerAdmin = async ({ username, password }) => {
  const tempConfig = {
    server: process.env.DB_SERVER || 'localhost',
    port: Number(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'THITRACNGHIEM',
    user: username,
    password: password,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };

  let tempPool;
  try {
    tempPool = new sql.ConnectionPool(tempConfig);
    await tempPool.connect();

    const result = await tempPool
      .request()
      .input("USERNAME", sql.NVarChar(50), username)
      .execute("sp_LoginGiangVienAdmin");

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Xac thuc SQL Server that bai cho login:", username, error.message);
    return null;
  } finally {
    if (tempPool && tempPool.connected) {
      await tempPool.close();
    }
  }
};

const loginStudent = async ({ masv }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("MASV", sql.NChar(8), masv)
    .execute("sp_LoginSinhVien");

  return result.recordset[0] || null;
};

module.exports = {
  loginLecturerAdmin,
  loginStudent,
};

