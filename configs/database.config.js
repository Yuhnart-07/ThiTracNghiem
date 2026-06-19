const sql = require('mssql');

const toBoolean = (value, defaultValue) => {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value === 'true';
};

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'THITRACNGHIEM',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '1182005@Phuc',
  options: {
    encrypt: toBoolean(process.env.DB_ENCRYPT, false),
    trustServerCertificate: toBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, true),
  },
};

let pool;

const connectDB = async () => {
  if (pool?.connected) {
    return pool;
  }

  pool = await sql.connect(dbConfig);
  console.log('Ket noi database thanh cong');
  return pool;
};

const getPool = () => {
  if (!pool?.connected) {
    throw new Error('Database chua duoc ket noi. Hay goi connectDB() truoc.');
  }

  return pool;
};

module.exports = {
  sql,
  connectDB,
  getPool,
};
