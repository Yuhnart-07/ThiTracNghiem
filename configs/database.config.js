const sql = require("mssql");

const sqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE || "THITRACNGHIEM",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const hasSqlLogin = Boolean(process.env.DB_USER);

if (hasSqlLogin) {
  sqlConfig.user = process.env.DB_USER;
  sqlConfig.password = process.env.DB_PASSWORD || "";
}

let poolPromise;

const connectDB = async () => {
  try {
    if (!hasSqlLogin) {
      console.warn("Chua cau hinh DB_USER/DB_PASSWORD, tam bo qua ket noi SQL Server.");
      return null;
    }

    if (!poolPromise) {
      poolPromise = sql.connect(sqlConfig);
    }

    const pool = await poolPromise;
    console.log("Ket noi SQL Server thanh cong!");
    return pool;
  } catch (error) {
    poolPromise = null;
    console.error("Ket noi SQL Server that bai!", error.message);
    throw error;
  }
};

const getPool = async () => {
  if (!hasSqlLogin) {
    throw new Error("Chua cau hinh DB_USER/DB_PASSWORD de ket noi SQL Server.");
  }

  if (!poolPromise) {
    return connectDB();
  }

  return poolPromise;
};

module.exports = {
  sql,
  connectDB,
  getPool,
};
