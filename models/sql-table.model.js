const { getPool } = require("../configs/database.config");

const allowedTables = new Set([
  "LOP",
  "MONHOC",
  "SINHVIEN",
  "GIAOVIEN",
  "GIAOVIEN_DANGKY",
  "BODE",
  "BANGDIEM",
]);

const assertAllowedTable = (tableName) => {
  if (!allowedTables.has(tableName)) {
    throw new Error(`Bang ${tableName} khong nam trong THITRACNGHIEM.sql`);
  }
};

const findTop = async (tableName, limit = 50) => {
  assertAllowedTable(tableName);

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const pool = await getPool();
  const result = await pool.request().query(`SELECT TOP (${safeLimit}) * FROM dbo.${tableName}`);

  return result.recordset;
};

module.exports = {
  allowedTables,
  findTop,
};
